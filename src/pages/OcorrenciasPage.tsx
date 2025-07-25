import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Ocorrencia {
  id: string;
  descricao: string;
  data: string;
  autor: {
    nome: string;
  };
}

const OcorrenciasPage: React.FC = () => {
  const { token } = useAuth();
  const [descricao, setDescricao] = useState('');
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  const fetchOcorrencias = useCallback(async () => {
    const res = await axios.get('http://localhost:5000/api/ocorrencias', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOcorrencias(res.data);
  }, [token]);

  useEffect(() => {
    fetchOcorrencias();
  }, [fetchOcorrencias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    await axios.post(
      'http://localhost:5000/api/ocorrencias',
      { descricao },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDescricao('');
    fetchOcorrencias();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Relatos de Ocorrência</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Descreva a ocorrência..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>

      <div className="space-y-4">
        {ocorrencias.map((oc) => (
          <div key={oc.id} className="border p-3 rounded bg-gray-50">
            <p className="text-sm text-gray-600">
              <strong>{oc.autor.nome}</strong> —{' '}
              {new Date(oc.data).toLocaleString()}
            </p>
            <p className="mt-1">{oc.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OcorrenciasPage;
