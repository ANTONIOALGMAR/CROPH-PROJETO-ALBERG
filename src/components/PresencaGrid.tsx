import React, { useState, useEffect, useCallback } from 'react';

interface Convivente {
  id: string;
  leito: number;
  nome: string;
  photoUrl?: string;
}

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
  token: string | null;
}

const PresencaGrid: React.FC<PresencaGridProps> = ({
  conviventes,
  dataSelecionada,
  onRegisterParticipation,
  token
}) => {
  const [presencasDoDia, setPresencasDoDia] = useState<Record<number, boolean>>({});
  const [loadingPresencas, setLoadingPresencas] = useState(true);
  const [errorPresencas, setErrorPresencas] = useState<string | null>(null);

  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;

  const fetchPresencasDoDia = useCallback(async () => {
    console.log('Token em PresencaGrid:', token);
    if (!token || !dataSelecionada) {
      setLoadingPresencas(false);
      return;
    }

    setLoadingPresencas(true);
    setErrorPresencas(null);

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/presenca?data=${dataSelecionada}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: { leito: number; presente: boolean }[] = await response.json();

      const newPresencas: Record<number, boolean> = {};
      data.forEach((p) => {
        newPresencas[p.leito] = p.presente;
      });

      setPresencasDoDia(newPresencas);
    } catch (error) {
      console.error('Erro ao carregar presenças do dia:', error);
      setErrorPresencas('Erro ao carregar dados de presença.');
    } finally {
      setLoadingPresencas(false);
    }
  }, [token, dataSelecionada, BASE_BACKEND_URL]);

  useEffect(() => {
    fetchPresencasDoDia();
  }, [fetchPresencasDoDia]);

  const leitosOcupados = new Map<number, Convivente>();
  conviventes.forEach((c) => {
    if (c.leito) {
      leitosOcupados.set(Number(c.leito), c);
    }
  });

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
      conviventeId ? conviventeId : null
    );
  };

  if (loadingPresencas) {
    return <p style={{ textAlign: 'center' }}>Carregando dados de presença...</p>;
  }

  if (errorPresencas) {
    return <p style={{ color: 'red', textAlign: 'center' }}>{errorPresencas}</p>;
  }

  return (
    <div
      style={{
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        marginTop: '20px'
      }}
    >
      <h3 style={{ marginBottom: '15px', color: '#555', textAlign: 'center' }}>
        Grid De Presença ({dataSelecionada})
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '8px'
        }}
      >
        {leitosArray.map((leitoNum) => {
          const conviventeNoLeito = leitosOcupados.get(leitoNum);
          const isPresente = presencasDoDia[leitoNum] === true;

          let backgroundColor = '#f0f0f0';
          let textColor = '#888';
          let borderColor = '#ccc';
          let statusText = 'Vazio';

          if (conviventeNoLeito) {
            statusText = conviventeNoLeito.nome.split(' ')[0];
            backgroundColor = '#e6ffe6';
            textColor = '#006600';
            borderColor = '#a3e9a4';
          }

          if (isPresente) {
            backgroundColor = '#d4edda';
            textColor = '#155724';
            borderColor = '#28a745';
            statusText = `${conviventeNoLeito ? conviventeNoLeito.nome.split(' ')[0] : 'Leito Vazio'} (Presente)`;
          } else if (
            Object.prototype.hasOwnProperty.call(presencasDoDia, leitoNum) &&
            presencasDoDia[leitoNum] === false
          ) {
            backgroundColor = '#f8d7da';
            textColor = '#721c24';
            borderColor = '#dc3545';
            statusText = `${conviventeNoLeito ? conviventeNoLeito.nome.split(' ')[0] : 'Leito Vazio'} (Ausente)`;
          }

          return (
            <div
              key={leitoNum}
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
                cursor: 'pointer'
              }}
              onClick={() => handleTogglePresenca(leitoNum)}
            >
              <span style={{ fontSize: '1.2em', marginBottom: '5px' }}>{leitoNum}</span>
              <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>{statusText}</span>
              {conviventeNoLeito?.photoUrl && (
                <img
                  src={`${BASE_BACKEND_URL}/${conviventeNoLeito.photoUrl}`}
                  alt={`Foto de ${conviventeNoLeito.nome}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginTop: '5px'
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
