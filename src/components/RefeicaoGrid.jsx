// frontend/src/components/RefeicaoGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';

const RefeicaoGrid = ({ tipoRefeicao, conviventes, dataSelecionada, onRegisterParticipation, token }) => {
  const [leitoInput, setLeitoInput] = useState('');
  // participacoes agora é um Set para busca rápida (leitos que participaram)
  const [participacoesLeitos, setParticipacoesLeitos] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar as participações do backend
  const fetchParticipations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = dataSelecionada; // Já está em YYYY-MM-DD
      const res = await fetch(`http://localhost:5000/api/participacao-refeicao?tipo=${tipoRefeicao}&data=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Filtra apenas os que participaram (participou: true) e pega o leito do convivente
      const leitosParticipantes = new Set(data.filter(p => p.participou).map(p => p.convivente.leito));
      setParticipacoesLeitos(leitosParticipantes);
    } catch (err) {
      console.error(`Erro ao buscar participações de ${tipoRefeicao} para ${dataSelecionada}:`, err);
      setError('Erro ao carregar dados de participação.');
    } finally {
      setLoading(false);
    }
  }, [tipoRefeicao, dataSelecionada, token]);

  // Efeito para carregar as participações sempre que o tipoRefeicao ou dataSelecionada mudarem
  useEffect(() => {
    fetchParticipations();
  }, [fetchParticipations]);


  const handleRegister = async () => {
    const leitoNum = parseInt(leitoInput, 10);
    if (isNaN(leitoNum) || leitoNum < 1 || leitoNum > 158) {
      alert('Por favor, insira um número de leito válido (1-158).');
      return;
    }

    const conviventeNoLeito = conviventes.find(c => parseInt(c.leito, 10) === leitoNum);

    if (!conviventeNoLeito) {
      alert(`Não há convivente cadastrado para o leito ${leitoNum}.`);
      return;
    }

    // Determina se o convivente já participou para alternar o status
    const isCurrentlyParticipating = participacoesLeitos.has(leitoNum);
    const newParticipationStatus = !isCurrentlyParticipating;

    // Chama a função centralizada na OrientadorPage para persistir no backend
    await onRegisterParticipation(
      conviventeNoLeito._id, // ID do convivente
      leitoNum,
      tipoRefeicao, // 'CAFE', 'ALMOCO', 'JANTAR'
      newParticipationStatus,
      dataSelecionada // Data do evento
    );

    // Após a chamada ao backend, recarrega os dados para refletir o estado real
    fetchParticipations();
    setLeitoInput(''); // Limpa o input
  };
  // ATUALIZE A QUANTIDADE TOTAL DE LEITOS AQUI
  const totalLeitos = 158;
  const leitosArray = Array.from({ length: totalLeitos }, (_, i) => i + 1);

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', marginTop: '20px' }}>
      <h3 style={{ textTransform: 'capitalize' }}>Grid de {tipoRefeicao} ({dataSelecionada})</h3>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="number"
          placeholder="Número do Leito"
          value={leitoInput}
          onChange={(e) => setLeitoInput(e.target.value)}
          min="1"
          max="154"
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
          const conviventeNoLeito = conviventes.find(c => parseInt(c.leito, 10) === leitoNum);
          const isOccupiedByConvivente = !!conviventeNoLeito; // True se há convivente no leito
          const hasParticipated = participacoesLeitos.has(leitoNum);

          let backgroundColor = '#f0f0f0'; // Cor padrão (vazio/disponível)
          let textColor = '#333';
          let borderStyle = '1px solid #ccc';

          if (isOccupiedByConvivente) {
            // Leito ocupado por um convivente cadastrado
            backgroundColor = '#28a745'; // Leito de convivente (verde)
            textColor = 'white';
            if (hasParticipated) {
              backgroundColor = '#ffc107'; // Leito de convivente que participou (amarelo)
              textColor = '#333';
            }
          }
          // Se não estiver ocupado por convivente, permanece cinza/padrão
          // Se estiver ocupado mas não participou, permanece verde

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
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {leitoNum}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RefeicaoGrid;