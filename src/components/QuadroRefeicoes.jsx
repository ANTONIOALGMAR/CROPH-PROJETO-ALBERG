import React from 'react';
import './QuadroRefeicoes.css'; // defina grid e cores

const TOTAL = 158;

const QuadroRefeicoes = ({ registros, refeicao }) => {
  const todayKey = new Date().toISOString().slice(0,10);
  const cells = Array.from({length: TOTAL}, (_, i) => {
    const num = i+1;
    const key = `${todayKey}_${refeicao}_${num}`;
    const fez = registros[key]; // true/false
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
