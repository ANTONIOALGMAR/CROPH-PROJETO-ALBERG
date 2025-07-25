// src/components/LeitosGrid.jsx
import React from 'react';
import './LeitosGrid.css';

const TOTAL_LEITOS = 158;

const LeitosGrid = ({ occupiedLeitos }) => {
  const cells = Array.from({ length: TOTAL_LEITOS }, (_, i) => {
    const num = i + 1;
    const occupied = occupiedLeitos.includes(num);
    return (
      <div
        key={num}
        className={`leito-cell ${occupied ? 'occupied' : 'free'}`}
      >
        {num}
      </div>
    );
  });

  return <div className="leitos-grid">{cells}</div>;
};

export default LeitosGrid;
