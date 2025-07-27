// frontend/src/components/LeitoMapaGrid.jsx

import React, { useState, useEffect } from 'react';

const LeitoMapaGrid = ({ conviventes, token }) => {
  const [leitosComConviventes, setLeitosComConviventes] = useState(new Map());

  // Função para mapear conviventes para seus respectivos leitos
  useEffect(() => {
    const map = new Map();
    conviventes.forEach(c => {
      if (c.leito) {
        map.set(parseInt(c.leito, 10), c);
      }
    });
    setLeitosComConviventes(map);
  }, [conviventes]); // Re-executa se a lista de conviventes mudar

  const leitosArray = Array.from({ length: 158 }, (_, i) => i + 1); // Leitos de 1 a 158

  // Adicione esta constante para a URL base do backend
  const BASE_BACKEND_URL = 'http://localhost:3001'; 

  return (
    <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginBottom: '15px', color: '#555', textAlign: 'center' }}>Mapa de Leitos e Conviventes</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
        {leitosArray.map((leitoNum) => {
          const conviventeNoLeito = leitosComConviventes.get(leitoNum);
          
          let backgroundColor = conviventeNoLeito ? '#e6ffe6' : '#f0f0f0'; // Verde claro para ocupado, cinza claro para vazio
          let textColor = conviventeNoLeito ? '#006600' : '#888';
          let borderColor = conviventeNoLeito ? '#a3e9a4' : '#ccc';

          return (
            <div
              key={leitoNum}
              style={{
                border: `1px solid ${borderColor}`,
                padding: '10px 5px',
                textAlign: 'center',
                backgroundColor: backgroundColor,
                color: textColor,
                borderRadius: '5px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80px', // Aumenta a altura para caber o nome
                fontSize: '0.9em'
              }}
            >
              <span style={{ fontSize: '1.2em', marginBottom: '5px' }}>{leitoNum}</span>
              {conviventeNoLeito ? (
                <>
                  <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>{conviventeNoLeito.nome.split(' ')[0]}</span>
                  {conviventeNoLeito.photoUrl && (
                    <img
                      // AQUI É A MUDANÇA: Construa a URL da imagem usando BASE_BACKEND_URL
                      src={`${BASE_BACKEND_URL}/${conviventeNoLeito.photoUrl}`}
                      alt={`Foto de ${conviventeNoLeito.nome}`}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px' }}
                    />
                  )}
                </>
              ) : (
                <span style={{ fontSize: '0.7em', color: '#999' }}>Vazio</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeitoMapaGrid;