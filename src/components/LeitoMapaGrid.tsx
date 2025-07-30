import React, { useState, useEffect } from 'react';

interface Convivente {
  id: string;
  nome: string;
  leito: number | string;
  photoUrl?: string;
}

interface LeitoMapaGridProps {
  conviventes: Convivente[];
  token: string;
}

const LeitoMapaGrid: React.FC<LeitoMapaGridProps> = ({ conviventes, token }) => {
  const [leitosComConviventes, setLeitosComConviventes] = useState<Map<number, Convivente>>(new Map());

  useEffect(() => {
    const map = new Map<number, Convivente>();
    conviventes.forEach((c) => {
      if (c.leito) {
        const leitoNum = typeof c.leito === 'string' ? parseInt(c.leito, 10) : c.leito;
        map.set(leitoNum, c);
      }
    });
    setLeitosComConviventes(map);
  }, [conviventes]);

  const leitosArray = Array.from({ length: 158 }, (_, i) => i + 1);

  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;

  return (
    <div
      style={{
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      }}
    >
      <h3 style={{ marginBottom: '15px', color: '#555', textAlign: 'center' }}>
        Mapa de Leitos e Conviventes
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '8px',
        }}
      >
        {leitosArray.map((leitoNum) => {
          const conviventeNoLeito = leitosComConviventes.get(leitoNum);

          const backgroundColor = conviventeNoLeito ? '#e6ffe6' : '#f0f0f0';
          const textColor = conviventeNoLeito ? '#006600' : '#888';
          const borderColor = conviventeNoLeito ? '#a3e9a4' : '#ccc';

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
                minHeight: '80px',
                fontSize: '0.9em',
              }}
            >
              <span style={{ fontSize: '1.2em', marginBottom: '5px' }}>{leitoNum}</span>
              {conviventeNoLeito ? (
                <>
                  <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>
                    {conviventeNoLeito.nome.split(' ')[0]}
                  </span>
                  {conviventeNoLeito.photoUrl && (
                    <img
                      src={`${BASE_BACKEND_URL}/${conviventeNoLeito.photoUrl}`}
                      alt={`Foto de ${conviventeNoLeito.nome}`}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginTop: '5px',
                      }}
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
