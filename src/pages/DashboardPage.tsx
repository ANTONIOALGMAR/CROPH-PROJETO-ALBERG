// frontend/src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const DashboardPage = () => {
  const [filtro, setFiltro] = useState<'diario' | 'semanal' | 'mensal'>('diario');
  const [dados, setDados] = useState<any[]>([]);

  useEffect(() => {
    // Aqui futuramente será uma chamada à API com base no filtro
    // Simulando dados por enquanto:
    const agora = new Date();
    const dataFake = Array.from({ length: filtro === 'mensal' ? 4 : filtro === 'semanal' ? 7 : 1 }, (_, i) => {
      const data = new Date(agora);
      if (filtro === 'mensal') data.setDate(data.getDate() - i * 7);
      else if (filtro === 'semanal') data.setDate(data.getDate() - i);
      return {
        data: format(data, 'dd/MM'),
        presencas: Math.floor(Math.random() * 20),
        faltas: Math.floor(Math.random() * 5),
        cafe: Math.floor(Math.random() * 20),
        almoco: Math.floor(Math.random() * 20),
        janta: Math.floor(Math.random() * 20),
      };
    }).reverse();

    setDados(dataFake);
  }, [filtro]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Dashboard de Refeições</h1>

      <div className="flex justify-center gap-4 mb-6">
        <button onClick={() => setFiltro('diario')} className={`px-4 py-2 rounded ${filtro === 'diario' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Diário</button>
        <button onClick={() => setFiltro('semanal')} className={`px-4 py-2 rounded ${filtro === 'semanal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Semanal</button>
        <button onClick={() => setFiltro('mensal')} className={`px-4 py-2 rounded ${filtro === 'mensal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Mensal</button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="presencas" fill="#4ade80" name="Presenças" />
          <Bar dataKey="faltas" fill="#f87171" name="Faltas" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-10">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cafe" fill="#facc15" name="Café" />
            <Bar dataKey="almoco" fill="#60a5fa" name="Almoço" />
            <Bar dataKey="janta" fill="#a78bfa" name="Janta" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
