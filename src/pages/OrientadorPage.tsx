// src/pages/OrientadorPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Convivente } from '../types/Convivente';
import RefeicaoGrid from '../components/RefeicaoGrid';
import PresencaGrid from '../components/PresencaGrid';
import ConviventesLista from '../components/ConviventesLista';
import LeitoMapaGrid from '../components/LeitoMapaGrid';
import OcorrenciaPage from './OcorrenciaPage';

const OrientadorPage: React.FC = (): React.JSX.Element => {
  const { usuario, token: jwtToken, loading } = useAuth();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<'presenca' | 'refeicoes' | 'lista' | 'mapa' | 'ocorrencias'>('presenca');
  const [refeicaoTab, setRefeicaoTab] = useState<'cafe' | 'almoco' | 'jantar'>('cafe');
  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;

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
      }

      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
          body: JSON.stringify(body)
        });
      } catch (error) {
        console.error('Erro ao registrar participação:', error);
      }
    },
    [jwtToken, conviventes, BASE_BACKEND_URL]
  );

  if (loading || !jwtToken) {
    return <div className="text-center mt-12"><p>Carregando...</p></div>;
  }

  if (!usuario || usuario.role !== 'ORIENTADOR') {
    return (
      <div className="text-center mt-12 text-red-500">
        <p>Acesso negado.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Login</button>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Página do Orientador</h1>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors">
            Logout
          </button>
        </div>

        <div className="bg-gray-200 rounded-lg p-2 flex space-x-2 mb-8">
          <button onClick={() => setMainTab('presenca')} className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'presenca' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Presença</button>
          <button onClick={() => setMainTab('refeicoes')} className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'refeicoes' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Refeições</button>
          <button onClick={() => setMainTab('lista')} className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'lista' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Lista de Conviventes</button>
          <button onClick={() => setMainTab('mapa')} className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'mapa' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Mapa de Leitos</button>
          <button onClick={() => setMainTab('ocorrencias')} className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'ocorrencias' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Ocorrências</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {mainTab === 'presenca' && (
            <PresencaGrid conviventes={conviventes} dataSelecionada={selectedDate} onRegisterParticipation={handleRegisterParticipation} token={jwtToken!} />
          )}

          {mainTab === 'refeicoes' && (
            <div>
              <div className="mb-5 text-center">
                <label>Data do Evento:</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="ml-2 p-2 border rounded"/>
              </div>
              <div className="bg-gray-200 rounded-lg p-2 flex space-x-2 mb-8">
                <button onClick={() => setRefeicaoTab('cafe')} className={`flex-1 text-center py-3 rounded-lg ${refeicaoTab === 'cafe' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Café da Manhã</button>
                <button onClick={() => setRefeicaoTab('almoco')} className={`flex-1 text-center py-3 rounded-lg ${refeicaoTab === 'almoco' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Almoço</button>
                <button onClick={() => setRefeicaoTab('jantar')} className={`flex-1 text-center py-3 rounded-lg ${refeicaoTab === 'jantar' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}>Jantar</button>
              </div>
              <RefeicaoGrid tipoRefeicao={refeicaoTab.toUpperCase() as 'CAFE' | 'ALMOCO' | 'JANTAR'} conviventes={conviventes} dataSelecionada={selectedDate} onRegisterParticipation={handleRegisterParticipation} token={jwtToken!} />
            </div>
          )}

          {mainTab === 'lista' && <ConviventesLista conviventes={conviventes} />}
          
          {mainTab === 'mapa' && <LeitoMapaGrid conviventes={conviventes} token={jwtToken!} />}

          {mainTab === 'ocorrencias' && <OcorrenciaPage />}
        </div>
      </div>
    </div>
  );
};

export default OrientadorPage;