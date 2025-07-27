// frontend/src/components/RefeicaoGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';

const RefeicaoGrid = ({ tipoRefeicao, conviventes, dataSelecionada, onRegisterParticipation, token }) => {
  const [leitoInput, setLeitoInput] = useState('');
  const [participacoesLeitos, setParticipacoesLeitos] = useState(new Map()); // Map: leitoNum -> { participou: boolean, conviventeNome: string }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchParticipations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = dataSelecionada;
      const res = await fetch(`http://localhost:5000/api/participacao-refeicao?tipo=${tipoRefeicao}&data=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      const newParticipacoesMap = new Map();
      data.forEach(p => {
        newParticipacoesMap.set(p.leito, {
          participou: p.participou,
          conviventeNome: p.convivente ? p.convivente.nome : null // Mantemos esta linha
        });
      });
      setParticipacoesLeitos(newParticipacoesMap);

    } catch (err) {
      console.error(`Erro ao buscar participações de ${tipoRefeicao} para ${dataSelecionada}:`, err);
      setError('Erro ao carregar dados de participação.');
    } finally {
      setLoading(false);
    }
  }, [tipoRefeicao, dataSelecionada, token]);

  useEffect(() => {
    fetchParticipations();
  }, [fetchParticipations]);

  const handleRegister = async () => {
    const leitoNum = parseInt(leitoInput, 10);
    if (isNaN(leitoNum) || leitoNum < 1 || leitoNum > 158) {
      alert('Por favor, insira um número de leito válido (1-158).');
      return;
    }

    // Lógica para alternar o status da participação:
    // 1. Pega a informação atual da participação para este leito
    const currentParticipationInfo = participacoesLeitos.get(leitoNum);
    // 2. Determina o novo status: Se já participou, o novo status será FALSE (desmarcar).
    //    Se não participou (ou não há registro), o novo status será TRUE (marcar).
    const newParticipationStatus = currentParticipationInfo ? !currentParticipationInfo.participou : true;

    // Chama a função centralizada na OrientadorPage para persistir no backend
    await onRegisterParticipation(
      leitoNum,
      tipoRefeicao,
      newParticipationStatus, // Envia o novo status
      dataSelecionada
    );

    // Após registrar/alternar, recarrega os dados para refletir o estado atualizado do banco
    fetchParticipations(); 
    setLeitoInput(''); // Limpa o input
  };


  const totalLeitos = 158;
  const leitosArray = Array.from({ length: totalLeitos }, (_, i) => i + 1);

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', marginTop: '20px' }}>
      <h3 style={{ textTransform: 'capitalize' }}>Grid de {tipoRefeicao} ({dataSelecionada})</h3>
      
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
          Registrar/Alternar Participação
        </button>
      </div>

      {loading && <p>Carregando participações...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '5px' }}>
        {leitosArray.map((leitoNum) => {
          const participationInfo = participacoesLeitos.get(leitoNum);
          const hasParticipated = participationInfo ? participationInfo.participou : false;
          // const displayNome = participationInfo ? participationInfo.conviventeNome : null; // REMOVA OU COMENTE ESTA LINHA
          
          let backgroundColor = hasParticipated ? '#d4edda' : '#f8d7da'; 
          let textColor = hasParticipated ? '#155724' : '#721c24';
          let borderStyle = '1px solid #c3e6cb'; 
          
          if (!hasParticipated) {
              borderStyle = '1px solid #f5c6cb'; 
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
                display: 'flex', // Mantém flex para centralização
                flexDirection: 'column', // Mantém flex para centralização
                justifyContent: 'center', // Mantém flex para centralização
                alignItems: 'center', // Mantém flex para centralização
                minHeight: '60px' // Mantém altura mínima
              }}
            >
              <span>{leitoNum}</span>
              {/* {displayNome && <span style={{ fontSize: '0.75em', opacity: '0.8', marginTop: '3px' }}>{displayNome.split(' ')[0]}</span>} REMOVA OU COMENTE ESTA LINHA */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RefeicaoGrid;