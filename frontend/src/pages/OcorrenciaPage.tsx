import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Tipos
interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  autor: {
    id: string;
    email: string;
  };
}

const OcorrenciasPage = () => {
  const { token, usuario } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [editingOcorrencia, setEditingOcorrencia] = useState<Ocorrencia | null>(null);

  const fetchOcorrencias = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/ocorrencias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOcorrencias(res.data);
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchOcorrencias();
  }, [fetchOcorrencias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) return;

    const url = editingOcorrencia
      ? `${process.env.REACT_APP_API_URL}/api/ocorrencias/${editingOcorrencia.id}`
      : `${process.env.REACT_APP_API_URL}/api/ocorrencias`;
    const method = editingOcorrencia ? 'put' : 'post';

    try {
      await axios[method](url, { titulo, descricao }, { headers: { Authorization: `Bearer ${token}` } });
      setTitulo('');
      setDescricao('');
      setEditingOcorrencia(null);
      fetchOcorrencias();
    } catch (error) {
      console.error('Erro ao enviar ocorrência:', error);
    }
  };

  const handleEdit = (ocorrencia: Ocorrencia) => {
    setEditingOcorrencia(ocorrencia);
    setTitulo(ocorrencia.titulo);
    setDescricao(ocorrencia.descricao);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta ocorrência?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/ocorrencias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchOcorrencias();
      } catch (error) {
        console.error('Erro ao deletar ocorrência:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingOcorrencia(null);
    setTitulo('');
    setDescricao('');
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Painel de Ocorrências</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Coluna do Feed de Ocorrências */}
        <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Feed de Relatos</h2>
          <div className="space-y-4 h-96 overflow-y-auto pr-2">
            {(ocorrencias || []).map((oc) => (
              <div key={oc.id} className="border p-3 rounded bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    <strong>{oc.autor?.email}</strong> —{' '}
                    {new Date(oc.data).toLocaleString()}
                  </p>
                  {usuario && usuario.id === oc.autor.id && (
                    <div>
                      <button onClick={() => handleEdit(oc)} className="bg-blue-500 text-white px-2 py-1 rounded border border-blue-700 hover:bg-blue-600 transition-colors mr-2 text-sm">Editar</button>
                      <button onClick={() => handleDelete(oc.id)} className="bg-red-500 text-white px-2 py-1 rounded border border-red-700 hover:bg-red-600 transition-colors text-sm">Deletar</button>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mt-1">{oc.titulo}</h3>
                <p className="mt-1 text-gray-800">{oc.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna do Formulário */}
        <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            {editingOcorrencia ? 'Editando Ocorrência' : 'Registrar Nova Ocorrência'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                id="titulo"
                type="text"
                className="w-full p-2 border rounded-md shadow-sm"
                placeholder="Título da ocorrência..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                id="descricao"
                className="w-full p-2 border rounded-md shadow-sm"
                rows={5}
                placeholder="Descreva a ocorrência..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingOcorrencia ? 'Atualizar' : 'Enviar'}
              </button>
              {editingOcorrencia && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OcorrenciasPage;
