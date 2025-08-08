import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalConviventes: 0,
    totalPresencasHoje: 0,
    totalRefeicoesHoje: 0,
    totalOcorrenciasHoje: 0,
  });

  const [graficoPresenca, setGraficoPresenca] = useState([]);
  const [graficoRefeicoes, setGraficoRefeicoes] = useState([]);
  const [graficoOcorrencias, setGraficoOcorrencias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [resStats, resPresenca, resRefeicoes, resOcorrencias] = await Promise.all([
          axios.get('http://localhost:3001/api/dashboard/stats', { headers }),
          axios.get('http://localhost:3001/api/dashboard/presencas', { headers }),
          axios.get('http://localhost:3001/api/dashboard/refeicoes', { headers }),
          axios.get('http://localhost:3001/api/dashboard/ocorrencias', { headers }),
        ]);

        setStats(resStats.data);
        setGraficoPresenca(resPresenca.data);
        setGraficoRefeicoes(resRefeicoes.data);
        setGraficoOcorrencias(resOcorrencias.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      }
    };

    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-4 grid gap-4">
      {/* Cards estatísticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm">Conviventes Cadastrados</p>
          <h2 className="text-2xl font-bold">{stats.totalConviventes}</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm">Presenças Hoje</p>
          <h2 className="text-2xl font-bold">{stats.totalPresencasHoje}</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm">Refeições Hoje</p>
          <h2 className="text-2xl font-bold">{stats.totalRefeicoesHoje}</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm">Ocorrências Hoje</p>
          <h2 className="text-2xl font-bold">{stats.totalOcorrenciasHoje}</h2>
        </div>
      </div>

      {/* Gráfico de presença por dia */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="text-xl font-semibold mb-4">Presença por Dia (Últimos 7 dias)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={graficoPresenca}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="presencas" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de refeições */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="text-xl font-semibold mb-4">Distribuição de Refeições</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={graficoRefeicoes}
              dataKey="quantidade"
              nameKey="tipo"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {graficoRefeicoes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de ocorrências por tipo */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="text-xl font-semibold mb-4">Ocorrências por Tipo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={graficoOcorrencias}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tipo" />
            <YAxis />
            <Bar dataKey="quantidade" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
