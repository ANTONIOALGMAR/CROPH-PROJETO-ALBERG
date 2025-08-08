import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useProtectedFetch } from '../../hooks/useProtectedFetch';

interface SemanaData {
  semana: string;
  presencas: number;
}

const GraficoPresencasSemanal: React.FC = () => {
  const { fetchData } = useProtectedFetch();
  const [data, setData] = useState<SemanaData[]>([]);

  useEffect(() => {
    fetchData('/api/dashboard/presencas-semanais')
      .then((result) => {
                        setData(Array.isArray(result) ? result : []);
      })
      .catch((error) => console.error('Erro ao buscar presenças semanais', error));
  }, [fetchData]);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Presenças Semanais</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="semana" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="presencas" fill="#3b82f6" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPresencasSemanal;