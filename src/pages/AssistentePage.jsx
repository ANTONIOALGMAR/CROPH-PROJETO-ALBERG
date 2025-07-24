import React, { useState } from 'react';
import LeitosGrid from '../components/LeitosGrid';

const AssistentePage = () => {
  const [cadastros, setCadastros] = useState([]);
  const [leito, setLeito] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const occupiedLeitos = cadastros.map(c => parseInt(c.leito, 10));

  const handleSubmit = e => {
    e.preventDefault();
    const parsedLeito = parseInt(leito, 10);

    if (isNaN(parsedLeito)) {
      alert('Informe um número válido de leito');
      return;
    }

    if (editIndex !== null) {
      const updated = cadastros.map((c, i) =>
        i === editIndex ? { leito: parsedLeito, nome, cpf, dataNascimento } : c
      );
      setCadastros(updated);
      setEditIndex(null);
    } else {
      if (cadastros.some(c => parseInt(c.leito, 10) === parsedLeito)) {
        alert('Leito já ocupado!');
        return;
      }
      setCadastros(prev => [
        ...prev,
        { leito: parsedLeito, nome, cpf, dataNascimento }
      ]);
    }

    clearForm();
  };

  const handleEdit = index => {
    const c = cadastros[index];
    setLeito(c.leito.toString());
    setNome(c.nome);
    setCpf(c.cpf);
    setDataNascimento(c.dataNascimento);
    setEditIndex(index);
  };

  const handleDelete = index => {
    setCadastros(prev => prev.filter((_, i) => i !== index));
    clearForm();
    if (editIndex === index) setEditIndex(null);
  };

  const clearForm = () => {
    setLeito(''); setNome(''); setCpf(''); setDataNascimento('');
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto' }}>
      <h2>Cadastro de Conviventes</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
        <input
          type="number" placeholder="Leito (número)"
          value={leito} onChange={e => setLeito(e.target.value)} required
        />
        <input
          type="text" placeholder="Nome"
          value={nome} onChange={e => setNome(e.target.value)} required
        />
        <input
          type="text" placeholder="CPF"
          value={cpf} onChange={e => setCpf(e.target.value)} required
        />
        <input
          type="date"
          value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required
        />
        <div>
          <button type="submit">
            {editIndex !== null ? 'Atualizar' : 'Adicionar'}
          </button>
          {editIndex !== null && (
            <button type="button" onClick={() => { clearForm(); setEditIndex(null); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3>Lista de Cadastrados</h3>
      {cadastros.length === 0 ? (
        <p>Nenhum convivente cadastrado.</p>
      ) : (
        <table border="1" cellPadding="4" style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Leito</th><th>Nome</th><th>CPF</th><th>Data Nasc.</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cadastros.map((c, i) => (
              <tr key={i}>
                <td>{c.leito}</td>
                <td>{c.nome}</td>
                <td>{c.cpf}</td>
                <td>{c.dataNascimento}</td>
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
