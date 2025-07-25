import React, { useState, useEffect } from 'react';
import LeitosGrid from '../components/LeitosGrid';

const AssistentePage = () => {
  const [cadastros, setCadastros] = useState([]);
  const [leito, setLeito] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/conviventes')
      .then(res => res.json())
      .then(data => setCadastros(data))
      .catch(err => console.error('Erro ao buscar dados:', err));
  }, []);

  const occupiedLeitos = cadastros.map(c => c.leito);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setLeito('');
    setNome('');
    setCpf('');
    setDataNascimento('');
    setPhotoFile(null);
    setPreview('');
    setEditIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedLeito = parseInt(leito, 10);
    if (isNaN(parsedLeito)) return alert('Informe um número válido de leito');

    const formData = new FormData();
    formData.append('leito', parsedLeito);
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('dataNascimento', dataNascimento);
    if (photoFile) formData.append('photo', photoFile);

    if (editIndex !== null) {
      const id = cadastros[editIndex]._id;
      const resp = await fetch(`http://localhost:5000/api/conviventes/${id}`, {
        method: 'PUT',
        body: formData,
      });
      const updated = await resp.json();
      setCadastros(prev => prev.map(c => (c._id === id ? updated : c)));
    } else {
      const resp = await fetch('http://localhost:5000/api/conviventes', {
        method: 'POST',
        body: formData,
      });
      const saved = await resp.json();
      setCadastros(prev => [...prev, saved]);
    }

    clearForm();
  };

  const handleEdit = (i) => {
    const c = cadastros[i];
    setLeito(c.leito.toString());
    setNome(c.nome);
    setCpf(c.cpf);
    setDataNascimento(c.dataNascimento.split('T')[0]);
    setPreview(c.photoUrl || '');
    setEditIndex(i);
  };

  const handleDelete = async (i) => {
    const id = cadastros[i]._id;
    await fetch(`http://localhost:5000/api/conviventes/${id}`, {
      method: 'DELETE',
    });
    setCadastros(prev => prev.filter((_, idx) => idx !== i));
    clearForm();
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 16 }}>
      <h2>Cadastro de Conviventes</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
        <input type="number" placeholder="Leito" value={leito} onChange={e => setLeito(e.target.value)} required />
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
        <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} required />
        <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required />

        <div>
          <label>Foto:</label><br />
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 8 }}
            />
          )}
        </div>

        <div>
          <button type="submit">{editIndex !== null ? 'Salvar edição' : 'Cadastrar'}</button>
          {editIndex !== null && (
            <button type="button" onClick={clearForm}>Cancelar</button>
          )}
        </div>
      </form>

      <h3>Lista de Cadastrados</h3>
      {cadastros.length === 0 ? (
        <p>Nenhum convivente cadastrado.</p>
      ) : (
        <table border="1" cellPadding="4" style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr><th>Leito</th><th>Foto</th><th>Nome</th><th>CPF</th><th>Data Nasc.</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {cadastros.map((c, i) => (
              <tr key={c._id}>
                <td>{c.leito}</td>
                <td>
                  {c.photoUrl && (
                    <img
                      src={c.photoUrl}
                      alt={c.nome}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
                    />
                  )}
                </td>
                <td>{c.nome}</td>
                <td>{c.cpf}</td>
                <td>{new Date(c.dataNascimento).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(i)}>Editar</button>{' '}
                  <button onClick={() => handleDelete(i)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Leitos</h3>
      <LeitosGrid occupiedLeitos={occupiedLeitos} />
    </div>
  );
};

export default AssistentePage;

