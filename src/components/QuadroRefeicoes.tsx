import React from 'react';
import './QuadroRefeicoes.css';

interface QuadroRefeicoesProps {
  registros: Record<string, boolean>; // chave string com valor booleano (true/false)
  refeicao: string;
}

const TOTAL = 158;

const QuadroRefeicoes: React.FC<QuadroRefeicoesProps> = ({ registros, refeicao }) => {
  const todayKey = new Date().toISOString().slice(0, 10);

  const cells = Array.from({ length: TOTAL }, (_, i) => {
    const num = i + 1;
    const key = `${todayKey}_${refeicao}_${num}`;
    const fez = registros[key]; // true/false ou undefined

    return (
      <div key={num} className={`cell ${fez ? 'done' : 'miss'}`}>
        {num}
      </div>
    );
  });

  return (
    <div>
      <h3>{refeicao.charAt(0).toUpperCase() + refeicao.slice(1)}</h3>
      <div className="grid">{cells}</div>
    </div>
  );
};

export default QuadroRefeicoes;
