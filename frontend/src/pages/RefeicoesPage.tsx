import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

const RefeicoesPage: React.FC = (): React.JSX.Element => {
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [refeicoes, setRefeicoes] = useState<Record<string, Partial<Refeicao>>>({});
  const [busca, setBusca] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get<Convivente[]>('http://localhost:5000/api/conviventes', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setConviventes(res.data))
      .catch(err => console.error('Erro ao buscar conviventes:', err));

    axios.get<Refeicao[]>(`http://localhost:5000/api/refeicoes?data=${dataSelecionada}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const map: Record<string, Partial<Refeicao>> = {};
      res.data.forEach(r => map[r.conviventeId] = r);
      setRefeicoes(map);
    }).catch(err => console.error('Erro ao buscar refeições:', err));
  }, [dataSelecionada, token]);

  const handleToggle = useCallback(async (conviventeId: string, tipo: 'cafe' | 'almoco' | 'jantar') => {
    const existente = refeicoes[conviventeId] || {
      conviventeId,
      data: dataSelecionada,
      cafe: false,
      almoco: false,
      jantar: false
    };
    const convivente = conviventes.find(c => c._id === conviventeId); // Encontrar o convivente
    if (!convivente) {
      console.error('Convivente não encontrado para o ID:', conviventeId);
      return;
    }
    const updated = { ...existente, [tipo]: !existente[tipo], leito: convivente.leito }; // Adicionar leito
    try {
      await axios.post('http://localhost:3001/api/participacao-refeicao', updated, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefeicoes(prev => ({ ...prev, [conviventeId]: updated }));
    } catch (error) {
      console.error('Erro ao atualizar refeição:', error);
    }
  }, [refeicoes, dataSelecionada, token, conviventes]); // Adicionar conviventes às dependências

  const conviventesFiltrados = useMemo(() => 
    conviventes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase())),
    [conviventes, busca]
  );

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Controle de Refeições</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="date"
          value={dataSelecionada}
          onChange={e => setDataSelecionada(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        />
        <input
          type="text"
          placeholder="Buscar convivente"
          value={busca}
          onChange={e => setBusca(e.target.value)}
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
            {conviventesFiltrados.map(c => {
              const r = refeicoes[c._id] || {};
              return (
                <tr key={c._id} className="hover:bg-gray-50 text-sm text-center">
                  <td className="border p-2 text-left">{c.nome}</td>
                  <td className="border p-2">{c.quarto}</td>
                  <td className="border p-2">{c.leito}</td>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={r.cafe ?? false}
                      onChange={() => handleToggle(c._id, 'cafe')}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={r.almoco ?? false}
                      onChange={() => handleToggle(c._id, 'almoco')}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={r.jantar ?? false}
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
