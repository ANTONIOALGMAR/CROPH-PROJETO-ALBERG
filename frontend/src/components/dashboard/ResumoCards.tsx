import React from 'react';

interface Props {
  resumo: {
    totalPresencas: number;
    faltas: number;
    refeicoes: { cafe: number; almoco: number; jantar: number };
  };
}

const ResumoCards: React.FC<Props> = ({ resumo }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="bg-white rounded-2xl shadow p-4">
        <p className="text-gray-500">Presenças</p>
        <p className="text-2xl font-bold">{resumo.totalPresencas}</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-4">
        <p className="text-gray-500">Faltas</p>
        <p className="text-2xl font-bold">{resumo.faltas}</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-4">
        <p className="text-gray-500">Café</p>
        <p className="text-2xl font-bold">{resumo.refeicoes.cafe}</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-4">
        <p className="text-gray-500">Almoço / Janta</p>
        <p className="text-2xl font-bold">
          {resumo.refeicoes.almoco} / {resumo.refeicoes.jantar}
        </p>
      </div>
    </div>
  );
};

export default ResumoCards;
