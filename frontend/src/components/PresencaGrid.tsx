import React, { useState, useEffect, useCallback } from 'react';
import useProtectedFetch from './useProtectedFetch';
import { useAuth } from '../context/AuthContext';
import { Presenca } from '../types';
import { Convivente } from '../types/Convivente';

interface PresencaGridProps {
  conviventes: Convivente[];
  dataSelecionada: string;
  onRegisterParticipation: (
    leito: number,
    tipo: 'PRESENCA',
    presente: boolean,
    data: string,
    conviventeId: string | null
  ) => Promise<void>;
}

const PresencaGrid: React.FC<PresencaGridProps> = ({
  conviventes,
  dataSelecionada,
  onRegisterParticipation,
}) => {
  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;

  const { data: fetchedPresencas, loading, error, fetchData } = useProtectedFetch<Presenca[]>();
  const { token } = useAuth();

  const [presencasDoDia, setPresencasDoDia] = useState<Record<number, boolean>>({});

  const fetchPresencas = useCallback(async () => {
    if (!dataSelecionada) return;
    const data = await fetchData(`${BASE_BACKEND_URL}/api/presenca?data=${dataSelecionada}`);
    if (data) {
      const newPresencas: Record<number, boolean> = {};
      data.forEach((p) => {
        newPresencas[p.leito] = p.presente;
      });
      setPresencasDoDia(newPresencas);
    }
  }, [dataSelecionada, BASE_BACKEND_URL, fetchData]);

  useEffect(() => {
    if (token) {
      fetchPresencas();
    }
  }, [fetchPresencas, token]);
  if (!conviventes) {
    return <p>Carregando conviventes para o grid de presença...</p>;
  }

  const leitosOcupados = new Map<number, Convivente>();
  if (conviventes && Array.isArray(conviventes)) {
    conviventes.forEach((c) => {
      if (c.leito) {
        leitosOcupados.set(Number(c.leito), c);
      }
    });
  }

  const leitosArray = Array.from({ length: 158 }, (_, i) => i + 1);

  const handleTogglePresenca = async (leitoNum: number) => {
    const conviventeNoLeito = leitosOcupados.get(leitoNum);
    const conviventeId = conviventeNoLeito ? conviventeNoLeito.id : null;
    const isPresente = !presencasDoDia[leitoNum];

    await onRegisterParticipation(
      leitoNum,
      'PRESENCA',
      isPresente,
      dataSelecionada,
      conviventeId
    );
    fetchPresencas();
  };

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Carregando dados de presença...</p>;
  }

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
  }

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
        Grid De Presença ({dataSelecionada})
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
          const isPresente = presencasDoDia[leitoNum] === true;

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

          if (isPresente) {
            backgroundColor = '#d4edda';
            textColor = '#155724';
            borderColor = '#28a745';
            statusText = `${convivente ? convivente.nome.split(' ')[0] : 'Leito Vazio'} (Presente)`;
          } else if (
            Object.prototype.hasOwnProperty.call(presencasDoDia, leitoNum) &&
            presencasDoDia[leitoNum] === false
          ) {
            backgroundColor = '#f8d7da';
            textColor = '#721c24';
            borderColor = '#dc3545';
            statusText = `${convivente ? convivente.nome.split(' ')[0] : 'Leito Vazio'} (Ausente)`;
          }

          return (
            <div
              key={leitoNum}
              onClick={() => handleTogglePresenca(leitoNum)}
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

export default PresencaGrid;
