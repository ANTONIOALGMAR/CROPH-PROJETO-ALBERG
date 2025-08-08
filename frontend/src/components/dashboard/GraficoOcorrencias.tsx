import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useProtectedFetch } from '../../hooks/useProtectedFetch';

const GraficoOcorrencias: React.FC = () => {
  const [data, setData] = useState<Array<{ semana: string; quantidade: number; }>>([]);
  const { fetchData } = useProtectedFetch<Array<{ semana: string; quantidade: number; }>>();

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchData('/api/dashboard/ocorrencias');
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.error('Erro ao buscar dados de ocorrências:', error);
      }
    };
    load();
  }, [fetchData]);

  return (
    <div className="w-full h-64 bg-white rounded-2xl p-4 shadow-md">
      <h2 className="text-lg font-bold mb-2">Ocorrências por Semana</h2>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semana" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="quantidade" stroke="#6366f1" fill="#c7d2fe" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoOcorrencias;