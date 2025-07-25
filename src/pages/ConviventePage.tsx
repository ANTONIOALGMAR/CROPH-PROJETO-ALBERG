import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

type Convivente = {
  id: string;
  nome: string;
  leito: string;
  quarto: string;
  responsavel: string;
};

const ConviventesPage = () => {
  const { token } = useAuth();
  const [conviventes, setConviventes] = useState<Convivente[]>([]);

  useEffect(() => {
  const fetchConviventes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/conviventes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConviventes(res.data);
    } catch (error) {
      console.error('Erro ao buscar conviventes:', error);
    }
  };

  fetchConviventes();
}, [token]); // Token como dependência


  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Lista de Conviventes</h2>

      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Nome</th>
            <th className="px-4 py-2 text-left">Quarto</th>
            <th className="px-4 py-2 text-left">Leito</th>
            <th className="px-4 py-2 text-left">Responsável</th>
          </tr>
        </thead>
        <tbody>
          {conviventes.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">{c.nome}</td>
              <td className="px-4 py-2">{c.quarto}</td>
              <td className="px-4 py-2">{c.leito}</td>
              <td className="px-4 py-2">{c.responsavel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConviventesPage;
