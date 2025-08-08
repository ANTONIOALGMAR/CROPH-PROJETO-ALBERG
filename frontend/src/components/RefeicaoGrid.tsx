import React, { useState, useEffect, useCallback } from 'react';
import useProtectedFetch from './useProtectedFetch';
import { Participacao } from '../types';
import { Convivente } from '../types/Convivente'; // Importar Convivente

export interface RefeicaoGridProps {
  tipoRefeicao: 'CAFE' | 'ALMOCO' | 'JANTAR';
  conviventes: Array<{ leito: number; nome: string; id: string; photoUrl?: string }>; // Adicionar photoUrl
  dataSelecionada: string;
  onRegisterParticipation: (
    leito: number,
    tipoEvento: string,
    participou: boolean,
    dataEvento: string
  ) => Promise<void>;
}

const RefeicaoGrid: React.FC<RefeicaoGridProps> = ({
  tipoRefeicao,
  conviventes,
  dataSelecionada,
  onRegisterParticipation
}): React.JSX.Element => {
  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;
  const { data: fetchedParticipacoes, loading, error, fetchData } = useProtectedFetch<Participacao[]>();

  const [participacoes, setParticipacoes] = useState<Participacao[]>([]);

  const fetchParticipacoes = useCallback(async () => {
    if (!dataSelecionada) return;
    try {
      const data = await fetchData(`${BASE_BACKEND_URL}/api/participacao-refeicao?data=${dataSelecionada}&tipo=${tipoRefeicao}`);
      if (data) setParticipacoes(data);
    } catch (err) {
      console.error('Erro ao carregar participações:', err);
    }
  }, [dataSelecionada, tipoRefeicao, BASE_BACKEND_URL, fetchData]);

  useEffect(() => { fetchParticipacoes(); }, [fetchParticipacoes]);

  useEffect(() => {
    if (fetchedParticipacoes) {
      setParticipacoes(fetchedParticipacoes);
    }
  }, [fetchedParticipacoes]);

  if (!conviventes) {
    return <p>Carregando conviventes para o grid de refeições...</p>;
  }

  const leitosOcupados = new Map<number, Convivente>();
  if (conviventes && Array.isArray(conviventes)) {
    conviventes.forEach((c) => {
      if (c.leito) {
        leitosOcupados.set(Number(c.leito), c as Convivente); // Adicionar cast
      }
    });
  }

  const alternarParticipacao = async (leitoNum: number) => {
    const currentParticipacao = participacoes.find(p => p.leito === leitoNum);
    const participou = !currentParticipacao?.participou; // Alterna o estado

    // Atualiza o estado local imediatamente para feedback visual
    setParticipacoes(prev => {
      const newParticipacoes = prev.filter(p => p.leito !== leitoNum); // Remove o antigo
      if (participou) { // Adiciona o novo se estiver participando
        newParticipacoes.push({
          leito: leitoNum,
          data: dataSelecionada,
          tipo: tipoRefeicao,
          participou: true,
          id: currentParticipacao?.id || `temp-${leitoNum}-${Date.now()}` // Adiciona um ID temporário se for novo
        });
      }
      return newParticipacoes;
    });

    try {
      await onRegisterParticipation(leitoNum, tipoRefeicao, participou, dataSelecionada);
      // Após o sucesso, refetch para garantir a consistência com o backend
      fetchParticipacoes();
    } catch (error) {
      console.error('Erro ao atualizar refeição:', error);
      // Em caso de erro, reverte o estado local (opcional, mas boa prática)
      fetchParticipacoes();
    }
  };

  const leitosArray = Array.from({ length: 158 }, (_, i) => i + 1);

  if (loading) return <p style={{ textAlign: 'center' }}>Carregando dados de refeições...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div
      style={{
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        marginTop: '20px',
      }}
    >
      <h3 style={{ marginBottom: '15px', color: '#555', textAlign: 'center' }}>
        Grid de Refeições ({tipoRefeicao}) - ({dataSelecionada})
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '8px',
        }}
      >
        {leitosArray.map((leitoNum) => {
          const convivente = leitosOcupados.get(leitoNum);
          const participacao = participacoes.find(p => p.leito === leitoNum);
          const isParticipando = participacao?.participou === true;

          let backgroundColor = '#f0f0f0';
          let textColor = '#888';
          let borderColor = '#ccc';
          let statusText = 'Vazio';

          if (convivente) {
            statusText = convivente.nome.split(' ')[0];
            backgroundColor = '#e6ffe6';
            textColor = '#006600';
            borderColor = '#a3e9a4';
          }

          if (isParticipando) {
            backgroundColor = '#d4edda';
            textColor = '#155724';
            borderColor = '#28a745';
            statusText = `${convivente ? convivente.nome.split(' ')[0] : 'Leito Vazio'} (Presente)`;
          } else if (
            participacao && participacao.participou === false
          ) {
            backgroundColor = '#f8d7da';
            textColor = '#721c24';
            borderColor = '#dc3545';
            statusText = `${convivente ? convivente.nome.split(' ')[0] : 'Leito Vazio'} (Ausente)`;
          }

          return (
            <div
              key={leitoNum}
              onClick={() => alternarParticipacao(leitoNum)}
              style={{
                border: `1px solid ${borderColor}`,
                padding: '10px 5px',
                textAlign: 'center',
                backgroundColor,
                color: textColor,
                borderRadius: '5px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80px',
                fontSize: '0.9em',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.2em', marginBottom: '5px' }}>{leitoNum}</span>
              <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>{statusText}</span>
              {convivente?.photoUrl && (
                <img
                  src={`${BASE_BACKEND_URL}/${convivente.photoUrl}`}
                  alt={`Foto de ${convivente.nome}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginTop: '5px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RefeicaoGrid;