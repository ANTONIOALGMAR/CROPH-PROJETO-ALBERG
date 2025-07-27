// frontend/src/components/OrientadorNavbar.jsx
import React from 'react';

const OrientadorNavbar = ({ onSelectGrid }) => {
  return (
    <nav style={{ backgroundColor: '#f0f0f0', padding: '10px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
      <button
        onClick={() => onSelectGrid('cafe')}
        style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', backgroundColor: 'white' }}
      >
        Café
      </button>
      <button
        onClick={() => onSelectGrid('almoco')}
        style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', backgroundColor: 'white' }}
      >
        Almoço
      </button>
      <button
        onClick={() => onSelectGrid('jantar')}
        style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', backgroundColor: 'white' }}
      >
        Jantar
      </button>
      <button
        onClick={() => onSelectGrid('presenca')} // novo botao
        style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', backgroundColor: 'white' }}
      >
        Presença
      </button>
    </nav>
  );
};

export default OrientadorNavbar;