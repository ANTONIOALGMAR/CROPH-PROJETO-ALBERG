// src/components/OrientadorNavbar.tsx
import React from 'react';

interface OrientadorNavbarProps {
  onSelectGrid: (type: 'cafe' | 'almoco' | 'jantar' | 'presenca') => void;
}

const OrientadorNavbar: React.FC<OrientadorNavbarProps> = ({ onSelectGrid }) => {
  return (
    <nav style={{
      backgroundColor: '#f0f0f0',
      padding: '10px 20px',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-around',
      marginBottom: '20px'
    }}>
      <button onClick={() => onSelectGrid('cafe')} style={btnStyle}>Café</button>
      <button onClick={() => onSelectGrid('almoco')} style={btnStyle}>Almoço</button>
      <button onClick={() => onSelectGrid('jantar')} style={btnStyle}>Jantar</button>
      <button onClick={() => onSelectGrid('presenca')} style={btnStyle}>Presença</button>
    </nav>
  );
};

const btnStyle: React.CSSProperties = {
  padding: '8px 15px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  cursor: 'pointer',
  backgroundColor: 'white',
};

export default OrientadorNavbar;
