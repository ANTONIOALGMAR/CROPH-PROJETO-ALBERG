import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProtectedFetch } from '../../hooks/useProtectedFetch';

interface RefeicaoMes {
  mes: string;
  cafe: number;
  almoco: number;
  jantar: number;
}

const GraficoRefeicoesMensal: React.FC = () => {
  const { fetchData } = useProtectedFetch();
  const [data, setData] = useState<RefeicaoMes[]>([]);

  useEffect(() => {
    fetchData('/api/dashboard/refeicoes-mensais')
      .then((result) => {
                        setData(Array.isArray(result) ? result : []);
      })
      .catch((err) => console.error('Erro ao carregar refeições mensais', err));
  }, [fetchData]);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Refeições por Mês</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cafe" stroke="#facc15" name="Café" />
          <Line type="monotone" dataKey="almoco" stroke="#10b981" name="Almoço" />
          <Line type="monotone" dataKey="jantar" stroke="#8b5cf6" name="Jantar" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoRefeicoesMensal;