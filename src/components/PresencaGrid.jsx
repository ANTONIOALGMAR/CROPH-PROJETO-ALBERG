// frontend/src/components/PresencaGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns'; // Importar format do date-fns

const PresencaGrid = ({ conviventes, dataSelecionada, onRegisterParticipation, token }) => {
  // Estado para armazenar o status de presença de cada leito para a data selecionada
  const [presencasDoDia, setPresencasDoDia] = useState({});
  const [loadingPresencas, setLoadingPresencas] = useState(true);
  const [errorPresencas, setErrorPresencas] = useState(null);

  const BASE_BACKEND_URL = 'http://localhost:3001'; // Adicione esta linha se não existir

  // Função para buscar as presenças para a data selecionada
  const fetchPresencasDoDia = useCallback(async () => {
    if (!token || !dataSelecionada) {
      setLoadingPresencas(false);
      return;
    }

    setLoadingPresencas(true);
    setErrorPresencas(null);
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/presenca?data=${dataSelecionada}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newPresencas = {};
      data.forEach(p => {
        newPresencas[p.leito] = p.presente;
      });
      setPresencasDoDia(newPresencas);
    } catch (error) {
      console.error('Erro ao carregar presenças do dia:', error);
      setErrorPresencas('Erro ao carregar dados de presença.');
    } finally {
      setLoadingPresencas(false);
    }
  }, [token, dataSelecionada]);

  // Efeito para buscar presenças quando a data selecionada ou o token mudam
  useEffect(() => {
    fetchPresencasDoDia();
  }, [fetchPresencasDoDia]);

  // Mapeia os conviventes para saber qual leito está ocupado
  const leitosOcupados = new Map();
  conviventes.forEach(c => {
    if (c.leito) {
      leitosOcupados.set(parseInt(c.leito, 10), c);
    }
  });

  const leitosArray = Array.from({ length: 158 }, (_, i) => i + 1); // Leitos de 1 a 158

  const handleTogglePresenca = async (leitoNum) => {
    const conviventeNoLeito = leitosOcupados.get(leitoNum);
    const conviventeId = conviventeNoLeito ? conviventeNoLeito.id : null;
    const isPresente = !presencasDoDia[leitoNum]; // Alterna o status atual

    await onRegisterParticipation(leitoNum, 'PRESENCA', isPresente, dataSelecionada, conviventeId);
    // Após registrar, busca novamente para atualizar a UI
    fetchPresencasDoDia(); 
  };

  if (loadingPresencas) {
    return <p style={{ textAlign: 'center' }}>Carregando dados de presença...</p>;
  }

  if (errorPresencas) {
    return <p style={{ color: 'red', textAlign: 'center' }}>{errorPresencas}</p>;
  }

  return (
    <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginBottom: '15px', color: '#555', textAlign: 'center' }}>Grid De Presença ({dataSelecionada})</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
        {leitosArray.map((leitoNum) => {
          const conviventeNoLeito = leitosOcupados.get(leitoNum);
          const isPresente = presencasDoDia[leitoNum] === true; // Verifica se a presença está registrada como true

          let backgroundColor = '#f0f0f0'; // Padrão: vazio ou sem registro
          let textColor = '#888';
          let borderColor = '#ccc';
          let statusText = 'Vazio';

          if (conviventeNoLeito) {
            statusText = conviventeNoLeito.nome.split(' ')[0]; // Nome do convivente
            backgroundColor = '#e6ffe6'; // Ocupado
            textColor = '#006600';
            borderColor = '#a3e9a4';
          }

          if (isPresente) {
            backgroundColor = '#d4edda'; // Verde mais escuro para presente
            textColor = '#155724';
            borderColor = '#28a745';
            statusText = `${conviventeNoLeito ? conviventeNoLeito.nome.split(' ')[0] : 'Leito Vazio'} (Presente)`;
          } else if (presencasDoDia.hasOwnProperty(leitoNum) && presencasDoDia[leitoNum] === false) {
            backgroundColor = '#f8d7da'; // Vermelho claro para ausente
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
                backgroundColor: backgroundColor,
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
                cursor: 'pointer' // Adiciona cursor para indicar que é clicável
              }}
              onClick={() => handleTogglePresenca(leitoNum)} // Adiciona o evento de clique
            >
              <span style={{ fontSize: '1.2em', marginBottom: '5px' }}>{leitoNum}</span>
              <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>{statusText}</span>
              {conviventeNoLeito && conviventeNoLeito.photoUrl && (
                <img
                  src={`${BASE_BACKEND_URL}/${conviventeNoLeito.photoUrl}`}
                  alt={`Foto de ${conviventeNoLeito.nome}`}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px' }}
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