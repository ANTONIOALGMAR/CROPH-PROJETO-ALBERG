// src/components/ConviventesLista.tsx
import React from 'react';
import { Convivente } from '../types/Convivente';

interface Props {
  conviventes: Convivente[];
}

const ConviventesLista: React.FC<Props> = ({ conviventes }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Lista de Conviventes</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Foto</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Nome</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Leito</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Quarto</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Assistente Social</th>
          </tr>
        </thead>
        <tbody>
          {conviventes.map((convivente) => (
            <tr key={convivente.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}><img src={`${process.env.REACT_APP_API_URL}/${convivente.photoUrl}`} alt={convivente.nome} style={{ width: '50px', height: '50px', objectFit: 'cover' }} /></td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{convivente.nome}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{convivente.leito}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{convivente.quarto}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{convivente.assistenteSocial}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConviventesLista;
