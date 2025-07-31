// src/pages/AssistentePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './AssistentePage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PresencaGrid from '../components/PresencaGrid';
import LeitoMapaGrid from '../components/LeitoMapaGrid';
import { format } from 'date-fns';
import { Convivente } from '../types/Convivente';
import OcorrenciaPage from './OcorrenciaPage';

const AssistentePage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { usuario, token: jwtToken, loading } = useAuth();

  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [selectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'presenca' | 'mapa' | 'ocorrencias'>('presenca');

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
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar conviventes:', err);
      setError('Erro ao carregar conviventes.');
      setConviventes([]);
    }
  }, [jwtToken, BASE_BACKEND_URL]);

  useEffect(() => {
    if (jwtToken) fetchConviventes();
  }, [jwtToken, fetchConviventes]);

  const handleRegisterParticipation = useCallback(
    async (leito: number, tipoEvento: string, participou: boolean, dataEvento: string) => {
      if (!jwtToken) return;
      try {
        const convivente = conviventes.find(c => c.leito === leito);
        await fetch(`${BASE_BACKEND_URL}/api/presenca`, {
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
    [jwtToken, conviventes, BASE_BACKEND_URL]
  );

  if (loading || !jwtToken) {
    return (
      <div className="text-center mt-12">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!usuario || usuario.role !== 'ASSISTENTE') {
    return (
      <div className="text-center mt-12 text-red-500">
        <p>Acesso negado. Você não tem permissão para acessar esta página.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Login</button>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Página da Assistente Social</h1>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors">
            Logout
          </button>
        </div>

        <div className="bg-gray-200 rounded-lg p-2 flex space-x-2 mb-8">
          <button onClick={() => setMainTab('presenca')} className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'presenca' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Presença</button>
          <button onClick={() => setMainTab('mapa')} className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'mapa' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Mapa de Leitos</button>
          <button onClick={() => setMainTab('ocorrencias')} className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'ocorrencias' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Ocorrências</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {mainTab === 'presenca' && (
            <PresencaGrid
              conviventes={conviventes}
              dataSelecionada={selectedDate}
              onRegisterParticipation={handleRegisterParticipation}
              token={jwtToken!}
            />
          )}

          {mainTab === 'mapa' && (
            <LeitoMapaGrid
              conviventes={conviventes}
              token={jwtToken!}
            />
          )}

          {mainTab === 'ocorrencias' && <OcorrenciaPage />}
        </div>
      </div>
    </div>
  );
};

export default AssistentePage;
