// src/pages/AssistentePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PresencaGrid from '../components/PresencaGrid';
import LeitoMapaGrid from '../components/LeitoMapaGrid';
import { format } from 'date-fns';
import { Convivente } from '../types/Convivente';

const AssistentePage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { usuario, token: jwtToken, loading } = useAuth();

  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [selectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !jwtToken) {
      navigate('/login');
    }
  }, [jwtToken, loading, navigate]);

  const fetchConviventes = useCallback(async () => {
    if (!jwtToken) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/conviventes`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Convivente[] = await res.json();

      setConviventes(data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar conviventes:', err);
      setError('Erro ao carregar conviventes.');
      setConviventes([]);
    }
  }, [jwtToken]);

  useEffect(() => {
    if (jwtToken) fetchConviventes();
  }, [jwtToken, fetchConviventes]);

  const handleRegisterParticipation = useCallback(
    async (leito: number, tipoEvento: string, participou: boolean, dataEvento: string) => {
      if (!jwtToken) return;
      try {
        const convivente = conviventes.find(c => c.leito === leito);
        await fetch(`${process.env.REACT_APP_API_URL}/api/presenca`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`
          },
          body: JSON.stringify({
            leito,
            data: dataEvento,
            presente: participou,
            conviventeId: convivente?.id ?? null
          })
        });
      } catch (err) {
        console.error('Erro no registro de presença:', err);
      }
    },
    [jwtToken, conviventes]
  );

  if (loading || !jwtToken) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!usuario || usuario.role !== 'ASSISTENTE') {
    return (
      <div>
        <p>Acesso negado. Você não tem permissão para acessar esta página.</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Página da Assistente Social</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <PresencaGrid
        conviventes={conviventes}
        dataSelecionada={selectedDate}
        onRegisterParticipation={handleRegisterParticipation}
        token={jwtToken}
      />
      <LeitoMapaGrid
        conviventes={conviventes}
        token={jwtToken}
      />
    </div>
  );
};

export default AssistentePage;
