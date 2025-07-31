// src/components/RefeicaoGrid.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Participacao {
  leito: number;
  participou: boolean;
}

export interface RefeicaoGridProps {
  tipoRefeicao: 'CAFE' | 'ALMOCO' | 'JANTAR';
  conviventes: Array<{ leito: number; nome: string; id: string }>;
  dataSelecionada: string;
  onRegisterParticipation: (
    leito: number,
    tipoEvento: string,
    participou: boolean,
    dataEvento: string
  ) => Promise<void>;
  token: string | null;
}

const RefeicaoGrid: React.FC<RefeicaoGridProps> = ({
  tipoRefeicao,
  conviventes,
  dataSelecionada,
  onRegisterParticipation,
  token
}): React.JSX.Element => {
  const [participacoes, setParticipacoes] = useState<Participacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipacoes = useCallback(async () => {
    console.log('Token em RefeicaoGrid:', token);
    console.log('Token em RefeicaoGrid:', token);
    if (!dataSelecionada || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Participacao[]>(`${process.env.REACT_APP_API_URL}/api/participacao-refeicao`, {
        params: { data: dataSelecionada, tipo: tipoRefeicao },
        headers: { Authorization: `Bearer ${token}` }
      });
      setParticipacoes(res.data);
    } catch {
      setError('Erro ao carregar participações');
    } finally {
      setLoading(false);
    }
  }, [dataSelecionada, tipoRefeicao, token, process.env.REACT_APP_API_URL]);

  useEffect(() => { fetchParticipacoes(); }, [fetchParticipacoes]);

  const alternarParticipacao = async (leito: number) => {
    const participou = !participacoes.some(p => p.leito === leito && p.participou);
    await onRegisterParticipation(leito, tipoRefeicao, participou, dataSelecionada);
    fetchParticipacoes();
  };

  const leitos = Array.from({ length: 158 }, (_, i) => i + 1);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {leitos.map((leito) => {
        const p = participacoes.find(x => x.leito === leito);
        const ativo = p?.participou ?? false;
        return (
          <button
            key={leito}
            onClick={() => alternarParticipacao(leito)}
            className={`p‑4 rounded‑xl font‑bold shadow-md ${
              ativo ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}
          >
            Leito {leito}
          </button>
        );
      })}
    </div>
  );
};

export default RefeicaoGrid;
