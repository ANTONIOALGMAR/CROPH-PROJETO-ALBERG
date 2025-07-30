// src/pages/OrientadorPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import OrientadorNavbar from '../components/OrientadorNavbar';
import RefeicaoGrid from '../components/RefeicaoGrid';
import PresencaGrid from '../components/PresencaGrid';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { Convivente } from '../types/Convivente';

const OrientadorPage: React.FC = (): React.JSX.Element => {
  const { usuario, token: jwtToken, loading } = useAuth();
  const navigate = useNavigate();
  const [activeGrid, setActiveGrid] = useState<'cafe' | 'almoco' | 'jantar' | 'presenca'>('cafe');
  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!loading && !jwtToken) {
      navigate('/login');
    }
  }, [jwtToken, loading, navigate]);

  const fetchConviventes = useCallback(async () => {
    if (!jwtToken) return;
    try {
      const res = await fetch(`${BASE_BACKEND_URL}/api/conviventes`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Convivente[] = await res.json();
      setConviventes(data);
    } catch {
      setConviventes([]);
    }
  }, [jwtToken, BASE_BACKEND_URL]);

  useEffect(() => {
    if (jwtToken) fetchConviventes();
  }, [jwtToken, fetchConviventes]);

  const handleRegisterParticipation = useCallback(
    async (leito: number, tipoEvento: string, participou: boolean, dataEvento: string) => {
      if (!jwtToken) return;

      const conviv = conviventes.find(c => c.leito === leito);
      const conviventeId = conviv ? conviv.id : null;
      let url: string;
      let body: Record<string, any> = { leito, data: dataEvento, conviventeId, participou };

      if (tipoEvento === 'PRESENCA') {
        url = `${BASE_BACKEND_URL}/api/presenca`;
        body.presente = participou;
      } else {
        url = `${BASE_BACKEND_URL}/api/participacao-refeicao`;
        body = {
          leito,
          data: dataEvento,
          tipo: tipoEvento,
          participou,
          ...(conviventeId && { convivente: { connect: { id: conviventeId } } }),
        };

      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
          body: JSON.stringify(body)
        });
        // Opcional: atualizar o estado local para refletir a mudança imediatamente
        // sem precisar de um novo fetch. Para uma implementação mais robusta,
        // você poderia usar o retorno da API para atualizar o estado.
      } catch (error) {
        console.error('Erro ao registrar participação:', error);
      }
    },
    [jwtToken, conviventes, BASE_BACKEND_URL]
  );

  if (loading || !jwtToken) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!usuario || usuario.role !== 'ORIENTADOR') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
        <p>Acesso negado. Você não tem permissão para acessar esta página.</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Página do Orientador</h1>
      <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ marginBottom: '20px' }}>
        Logout
      </button>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label>Data do Evento:</label>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      </div>

      <OrientadorNavbar onSelectGrid={setActiveGrid} />

      {activeGrid === 'presenca' ? (
        <PresencaGrid
          conviventes={conviventes}
          dataSelecionada={selectedDate}
          onRegisterParticipation={handleRegisterParticipation}
          token={jwtToken}
        />
      ) : (
        <RefeicaoGrid
          tipoRefeicao={activeGrid.toUpperCase() as 'CAFE' | 'ALMOCO' | 'JANTAR'}
          conviventes={conviventes}
          dataSelecionada={selectedDate}
          onRegisterParticipation={handleRegisterParticipation}
          token={jwtToken}
        />
      )}
    </div>
  );
};

export default OrientadorPage;
