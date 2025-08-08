import React, { useEffect, useState } from 'react';
import { FaUsers, FaCheckCircle, FaUtensils, FaExclamationCircle } from 'react-icons/fa';
import { useProtectedFetch } from '../../hooks/useProtectedFetch';

interface DashboardData {
  totalConviventes: number;
  presencasHoje: number;
  refeicoesHoje: {
    cafe: number;
    almoco: number;
    jantar: number;
  };
  ocorrenciasHoje: number;
}

const CardsDashboard: React.FC = () => {
  const { fetchData } = useProtectedFetch<DashboardData>();
  const [dados, setDados] = useState<DashboardData>({
    totalConviventes: 0,
    presencasHoje: 0,
    refeicoesHoje: { cafe: 0, almoco: 0, jantar: 0 },
    ocorrenciasHoje: 0,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const result = await fetchData('/api/dashboard/metricas');
        if (result) {
          console.log('Dados recebidos do dashboard:', result); // Adicionar log
          setDados(result);
        }
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      }
    };
    loadMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
      <div className="bg-blue-100 text-blue-800 rounded-2xl shadow p-4 flex items-center space-x-4">
        <FaUsers size={24} />
        <div>
          <h4 className="text-sm font-semibold">Total de Conviventes</h4>
          <p className="text-xl font-bold">{dados.totalConviventes}</p>
        </div>
      </div>

      <div className="bg-green-100 text-green-800 rounded-2xl shadow p-4 flex items-center space-x-4">
        <FaCheckCircle size={24} />
        <div>
          <h4 className="text-sm font-semibold">Presenças Hoje</h4>
          <p className="text-xl font-bold">{dados.presencasHoje}</p>
        </div>
      </div>

      <div className="bg-yellow-100 text-yellow-800 rounded-2xl shadow p-4 flex items-center space-x-4">
        <FaUtensils size={24} />
        <div>
          <h4 className="text-sm font-semibold">Refeições Hoje</h4>
          <p className="text-xl font-bold">☕ {dados.refeicoesHoje.cafe} | 🍽️ {dados.refeicoesHoje.almoco} | 🍜 {dados.refeicoesHoje.jantar}</p>
        </div>
      </div>

      <div className="bg-red-100 text-red-800 rounded-2xl shadow p-4 flex items-center space-x-4">
        <FaExclamationCircle size={24} />
        <div>
          <h4 className="text-sm font-semibold">Ocorrências Hoje</h4>
          <p className="text-xl font-bold">{dados.ocorrenciasHoje}</p>
        </div>
      </div>
    </div>
  );
};

export default CardsDashboard;