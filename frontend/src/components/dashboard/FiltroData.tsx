import React from 'react';

interface Props {
  filtro: 'DIA' | 'SEMANA' | 'MES';
  setFiltro: (filtro: 'DIA' | 'SEMANA' | 'MES') => void;
}

const FiltroData: React.FC<Props> = ({ filtro, setFiltro }) => {
  return (
    <div className="flex gap-2 mb-4">
      {['DIA', 'SEMANA', 'MES'].map((tipo) => (
        <button
          key={tipo}
          onClick={() => setFiltro(tipo as any)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            filtro === tipo
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {tipo === 'DIA' ? 'Diário' : tipo === 'SEMANA' ? 'Semanal' : 'Mensal'}
        </button>
      ))}
    </div>
  );
};

export default FiltroData;
