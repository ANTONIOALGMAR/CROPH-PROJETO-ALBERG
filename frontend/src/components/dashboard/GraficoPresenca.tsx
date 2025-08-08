import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useProtectedFetch } from '../../hooks/useProtectedFetch';

const GraficoPresenca: React.FC = () => {
  const [data, setData] = useState<Array<{ dia: string; quantidade: number; }>>([]);
  const { fetchData } = useProtectedFetch<Array<{ dia: string; quantidade: number; }>>();

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchData('/api/dashboard/presencas');
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.error('Erro ao buscar dados de presença:', error);
      }
    };
    load();
  }, [fetchData]);

  return (
    <div className="w-full h-64 bg-white rounded-2xl p-4 shadow-md">
      <h2 className="text-lg font-bold mb-2">Presenças por Dia</h2>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dia" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantidade" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPresenca;