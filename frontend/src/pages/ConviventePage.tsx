// src/pages/ConviventesPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Convivente } from '../types/Convivente';
import ConviventeForm from '../components/conviventeForm';

const ConviventesPage: React.FC = () => {
  const { token, loading } = useAuth();
  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    console.log('token no ConviventesPage:', token);
    if (!token || loading) return;

    const fetchConviventes = async () => {
      try {
        const res = await axios.get<Convivente[]>('http://localhost:3001/api/conviventes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConviventes(res.data);
      } catch (err: any) {
        console.error('Erro ao buscar conviventes:', err);
        setError('Falha ao carregar lista de conviventes.');
      }
    };

    fetchConviventes();
  }, [token, loading]);

  const handleFormSubmit = async (formData: any) => {
    try {
      const data = new FormData();
      const dataNascimentoDate = new Date(formData.dataNascimento);
      const dataNascimentoISO = dataNascimentoDate.toISOString();

      for (const key in formData) {
        if (key === 'photo' && formData[key]) {
          data.append(key, formData[key]);
        } else if (key === 'dataNascimento') {
          data.append('dataNascimento', dataNascimentoISO);
        } else if (key !== 'preview') {
          data.append(key, formData[key]);
        }
      }

      await axios.post('http://localhost:3001/api/conviventes', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowForm(false); // Esconde o formulário após o envio
      // Recarrega a lista de conviventes após o cadastro
      // (Você pode chamar fetchConviventes() aqui, mas para simplificar, vamos apenas esconder o formulário)
    } catch (err: any) {
      console.error('Erro ao cadastrar convivente:', err);
      setError(err.response?.data?.error || 'Erro ao cadastrar convivente.');
    }
  };

  if (loading) return <p>Verificando autenticação...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Lista de Conviventes</h2>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {showForm ? 'Cancelar Cadastro' : 'Cadastrar Novo Convivente'}
      </button>

      {showForm && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-bold mb-4">Cadastro de Convivente</h3>
          <ConviventeForm onSubmit={handleFormSubmit} />
        </div>
      )}

      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Nome</th>
            <th className="px-4 py-2 text-left">Quarto</th>
            <th className="px-4 py-2 text-left">Leito</th>
          </tr>
        </thead>
        <tbody>
          {conviventes.map((c) => (
            <tr key={c.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 text-left">{c.nome}</td>
              <td className="px-4 py-2 text-left">{c.quarto ?? '-'}</td>
              <td className="px-4 py-2 text-left">{c.leito ?? '-'}</td>
            </tr>
          ))}
          {conviventes.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                Nenhum convivente cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConviventesPage;
