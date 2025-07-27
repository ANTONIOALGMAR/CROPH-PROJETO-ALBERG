// frontend/src/components/PresencaGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';

const PresencaGrid = ({ conviventes, dataSelecionada, onRegisterParticipation, token }) => {
  const [leitoInput, setLeitoInput] = useState('');
  // participacoesLeitos agora armazena um Map: leitoNum -> { presente: boolean, conviventeNome: string }
  const [presencasLeitos, setPresencasLeitos] = useState(new Map()); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // A função fetchPresences agora busca presenças baseadas no leito
  const fetchPresences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = dataSelecionada; // A data já vem formatada do OrientadorPage
      const res = await fetch(`http://localhost:5000/api/presenca?data=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      // Criar um Map das presenças para acesso rápido e incluir info do convivente
      const newPresencasMap = new Map();
      data.forEach(p => {
        newPresencasMap.set(p.leito, {
          presente: p.presente,
          conviventeNome: p.convivente ? p.convivente.nome : null // Pega o nome do convivente se existir
        });
      });
      setPresencasLeitos(newPresencasMap);

    } catch (err) {
      console.error(`Erro ao buscar presenças para ${dataSelecionada}:`, err);
      setError('Erro ao carregar dados de presença.');
    } finally {
      setLoading(false);
    }
  }, [dataSelecionada, token]); // Depende da data selecionada e do token

  useEffect(() => {
    fetchPresences();
  }, [fetchPresences]); // Depende de fetchPresences (que já tem as dependências corretas)

  const handleRegister = async () => {
    const leitoNum = parseInt(leitoInput, 10);
    if (isNaN(leitoNum) || leitoNum < 1 || leitoNum > 158) {
      alert('Por favor, insira um número de leito válido (1-158).');
      return;
    }

    // Verifica o status atual da presença para alternar
    const currentPresence = presencasLeitos.get(leitoNum);
    const newPresenceStatus = currentPresence ? !currentPresence.presente : true; // Se não existe, assume que não está presente e marca como true

    // Chama a função centralizada na OrientadorPage para persistir no backend
    // O tipoEvento será 'PRESENCA' para este grid
    await onRegisterParticipation(
      leitoNum,
      'PRESENCA', // Tipo de evento específico para Presença
      newPresenceStatus,
      dataSelecionada
    );

    // Após registrar, recarrega os dados para refletir o estado atualizado do banco
    fetchPresences(); 
    setLeitoInput(''); // Limpa o input
  };

  const totalLeitos = 158;
  const leitosArray = Array.from({ length: totalLeitos }, (_, i) => i + 1);

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', marginTop: '20px' }}>
      <h3 style={{ textTransform: 'capitalize' }}>Grid de Presença ({dataSelecionada})</h3>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="number"
          placeholder="Número do Leito (1-158)"
          value={leitoInput}
          onChange={(e) => setLeitoInput(e.target.value)}
          min="1"
          max="158"
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={handleRegister} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Registrar/Alternar Presença
        </button>
      </div>

      {loading && <p>Carregando presenças...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '5px' }}>
        {leitosArray.map((leitoNum) => {
          const presenceInfo = presencasLeitos.get(leitoNum);
          const isPresent = presenceInfo ? presenceInfo.presente : false; // Renomeado para isPresent
          const displayNome = presenceInfo ? presenceInfo.conviventeNome : null;
          
          // Cores para Presença
          let backgroundColor = isPresent ? '#cce5ff' : '#ffeeba'; // Azul claro para presente, Amarelo claro para ausente
          let textColor = isPresent ? '#004085' : '#856404';
          let borderStyle = '1px solid #b8daff'; // Borda azul clara para presente
          
          if (!isPresent) {
              borderStyle = '1px solid #ffeeba'; // Borda amarela clara para ausente
          }

          return (
            <div
              key={leitoNum}
              style={{
                border: borderStyle,
                padding: '10px',
                textAlign: 'center',
                backgroundColor: backgroundColor,
                color: textColor,
                borderRadius: '5px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60px'
              }}
            >
              <span>{leitoNum}</span>
              {displayNome && <span style={{ fontSize: '0.75em', opacity: '0.8', marginTop: '3px' }}>{displayNome.split(' ')[0]}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PresencaGrid;