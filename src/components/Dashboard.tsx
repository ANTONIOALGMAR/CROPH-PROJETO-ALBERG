import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Estatistica {
  cafe: number;
  almoco: number;
  jantar: number;
  presencas: number;
  faltas: number;
}

interface Estatisticas {
  diaria: Estatistica;
  semanal: Estatistica;
  mensal: Estatistica;
}

interface ChartData {
  nome: string;
  diaria: number;
  semanal: number;
  mensal: number;
}

export default function Dashboard() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);

  useEffect(() => {
    axios
      .get<Estatisticas>('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => setEstatisticas(res.data))
      .catch((err) => {
        console.error('Erro ao carregar estatísticas:', err);
      });
  }, []);

  if (!estatisticas) return <p>Carregando estatísticas...</p>;

  const data: ChartData[] = [
    {
      nome: 'Café',
      diaria: estatisticas.diaria.cafe,
      semanal: estatisticas.semanal.cafe,
      mensal: estatisticas.mensal.cafe,
    },
    {
      nome: 'Almoço',
      diaria: estatisticas.diaria.almoco,
      semanal: estatisticas.semanal.almoco,
      mensal: estatisticas.mensal.almoco,
    },
    {
      nome: 'Jantar',
      diaria: estatisticas.diaria.jantar,
      semanal: estatisticas.semanal.jantar,
      mensal: estatisticas.mensal.jantar,
    },
    {
      nome: 'Presenças',
      diaria: estatisticas.diaria.presencas,
      semanal: estatisticas.semanal.presencas,
      mensal: estatisticas.mensal.presencas,
    },
    {
      nome: 'Faltas',
      diaria: estatisticas.diaria.faltas,
      semanal: estatisticas.semanal.faltas,
      mensal: estatisticas.mensal.faltas,
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="diaria" fill="#8884d8" />
          <Bar dataKey="semanal" fill="#82ca9d" />
          <Bar dataKey="mensal" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
