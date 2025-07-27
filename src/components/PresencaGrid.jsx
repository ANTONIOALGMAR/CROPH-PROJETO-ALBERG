// frontend/src/components/PresencaGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';

const PresencaGrid = ({ conviventes, dataSelecionada, onRegisterParticipation, token }) => {
  const [leitoInput, setLeitoInput] = useState('');
  const [presencaLeitos, setPresencaLeitos] = useState(new Set()); // Leitos presentes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar os registros de presença do backend
  const fetchPresenca = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = dataSelecionada; // Já está em YYYY-MM-DD
      const res = await fetch(`http://localhost:5000/api/presenca?data=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Filtra apenas os que estão presentes (presente: true) e pega o leito do convivente
      const leitosPresentes = new Set(data.filter(p => p.presente).map(p => p.convivente.leito));
      setPresencaLeitos(leitosPresentes);
    } catch (err) {
      console.error(`Erro ao buscar registros de presença para ${dataSelecionada}:`, err);
      setError('Erro ao carregar dados de presença.');
    } finally {
      setLoading(false);
    }
  }, [dataSelecionada, token]);

  // Efeito para carregar os registros de presença sempre que a dataSelecionada mudar
  useEffect(() => {
    fetchPresenca();
  }, [fetchPresenca]);

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

    // Determina se o convivente está atualmente presente para alternar o status
    const isCurrentlyPresent = presencaLeitos.has(leitoNum);
    const newPresenceStatus = !isCurrentlyPresent;

    // Chama a função centralizada na OrientadorPage para persistir no backend
    await onRegisterParticipation(
      conviventeNoLeito._id, // ID do convivente
      leitoNum,
      'PRESENCA', // Tipo de evento para presença
      newPresenceStatus,
      dataSelecionada // Data do evento
    );

    // Após a chamada ao backend, recarrega os dados para refletir o estado real
    fetchPresenca();
    setLeitoInput(''); // Limpa o input
  };

  // ATUALIZE A QUANTIDADE TOTAL DE LEITOS AQUI
  const totalLeitos = 158;
  const leitosArray = Array.from({ length: totalLeitos }, (_, i) => i + 1);

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', marginTop: '20px' }}>
      <h3 style={{ textTransform: 'capitalize' }}>Grid de Presença ({dataSelecionada})</h3>
      
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
          Registrar/Alternar Presença
        </button>
      </div>

      {loading && <p>Carregando registros de presença...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '5px' }}>
        {leitosArray.map((leitoNum) => {
          const conviventeNoLeito = conviventes.find(c => parseInt(c.leito, 10) === leitoNum);
          const isOccupiedByConvivente = !!conviventeNoLeito;
          const isPresent = presencaLeitos.has(leitoNum);

          let backgroundColor = '#f0f0f0'; // Cor padrão (leito vazio/não verificado)
          let textColor = '#333';
          let borderStyle = '1px solid #ccc';

          if (isOccupiedByConvivente) {
            if (isPresent) {
              backgroundColor = '#28a745'; // Convivente presente (verde)
              textColor = 'white';
            } else {
              backgroundColor = '#dc3545'; // Convivente ausente (vermelho)
              textColor = 'white';
            }
          }
          // Se não estiver ocupado por convivente, permanece cinza/padrão

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

export default PresencaGrid;