import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProtectedFetch } from '../../hooks/useProtectedFetch';

const COLORS = ['#34d399', '#facc15', '#f87171'];

const GraficoRefeicoes: React.FC = () => {
  const [data, setData] = useState<Array<{ tipo: string; quantidade: number; }>>([]);
  const { fetchData } = useProtectedFetch<Array<{ tipo: string; quantidade: number; }>>();

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchData('/api/dashboard/refeicoes');
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.error('Erro ao buscar dados de refeições:', error);
      }
    };
    load();
  }, [fetchData]);

  return (
    <div className="w-full h-64 bg-white rounded-2xl p-4 shadow-md">
      <h2 className="text-lg font-bold mb-2">Distribuição de Refeições</h2>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey="quantidade"
            nameKey="tipo"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoRefeicoes;