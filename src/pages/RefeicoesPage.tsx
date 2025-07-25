import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Convivente {
  _id: string;
  nome: string;
  quarto: string;
  leito: string;
}

interface Refeicao {
  conviventeId: string;
  data: string;
  cafe: boolean;
  almoco: boolean;
  jantar: boolean;
}

const RefeicoesPage: React.FC = () => {
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [refeicoes, setRefeicoes] = useState<Record<string, Refeicao>>({});
  const [busca, setBusca] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchConviventes = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/conviventes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConviventes(res.data);
      } catch (error) {
        console.error('Erro ao buscar conviventes:', error);
      }
    };

    const fetchRefeicoes = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/refeicoes?data=${dataSelecionada}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const refeicoesMap: Record<string, Refeicao> = {};
        res.data.forEach((r: Refeicao) => {
          refeicoesMap[r.conviventeId] = r;
        });
        setRefeicoes(refeicoesMap);
      } catch (error) {
        console.error('Erro ao buscar refeições:', error);
      }
    };

    fetchConviventes();
    fetchRefeicoes();
  }, [dataSelecionada, token]);

  const handleToggle = async (conviventeId: string, tipo: 'cafe' | 'almoco' | 'jantar') => {
    const refeicaoExistente = refeicoes[conviventeId] || {
      conviventeId,
      data: dataSelecionada,
      cafe: false,
      almoco: false,
      jantar: false,
    };

    const atualizado = {
      ...refeicaoExistente,
      [tipo]: !refeicaoExistente[tipo],
    };

    try {
      await axios.post('http://localhost:5000/api/refeicoes', atualizado, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefeicoes((prev) => ({
        ...prev,
        [conviventeId]: atualizado,
      }));
    } catch (error) {
      console.error('Erro ao atualizar refeição:', error);
    }
  };

  const conviventesFiltrados = conviventes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Controle de Refeições</h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        />
        <input
          type="text"
          placeholder="Buscar convivente"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm">
              <th className="border p-2 text-left">Nome</th>
              <th className="border p-2 text-left">Quarto</th>
              <th className="border p-2 text-left">Leito</th>
              <th className="border p-2">Café</th>
              <th className="border p-2">Almoço</th>
              <th className="border p-2">Jantar</th>
            </tr>
          </thead>
          <tbody>
            {conviventesFiltrados.map((c) => {
              const r = refeicoes[c._id] || {};
              return (
                <tr key={c._id} className="hover:bg-gray-50 text-sm text-center">
                  <td className="border p-2 text-left">{c.nome}</td>
                  <td className="border p-2">{c.quarto}</td>
                  <td className="border p-2">{c.leito}</td>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={r.cafe || false}
                      onChange={() => handleToggle(c._id, 'cafe')}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={r.almoco || false}
                      onChange={() => handleToggle(c._id, 'almoco')}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={r.jantar || false}
                      onChange={() => handleToggle(c._id, 'jantar')}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RefeicoesPage;
