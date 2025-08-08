// src/components/ConviventesLista.tsx
import React from 'react';
import { Convivente } from '../types/Convivente';

interface Props {
  conviventes: Convivente[];
  onEdit?: (convivente: Convivente) => void;
  onDelete?: (id: string) => void;
}

const ConviventesLista: React.FC<Props> = ({ conviventes, onEdit, onDelete }) => {
  const showActions = onEdit && onDelete;

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Lista de Conviventes</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px', width: '60px' }}>Foto</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', width: '300px' }}>Nome</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', width: '80px' }}>Leito</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', width: '80px' }}>Quarto</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', width: '150px' }}>Assistente Social</th>
            {showActions && <th style={{ border: '1px solid #ccc', padding: '8px', width: '180px' }}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {(conviventes || []).map((convivente) => {
            console.log('Convivente na lista:', convivente);
            return (
            <tr key={convivente.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}><img src={convivente.photoUrl ? `${process.env.REACT_APP_API_URL}/${convivente.photoUrl}` : 'https://via.placeholder.com/50'} alt={convivente.nome} style={{ width: '50px', height: '50px', objectFit: 'cover' }} /></td>
              <td style={{ border: '1px solid #ccc', padding: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{convivente.nome}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{convivente.leito}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{convivente.quarto}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{convivente.assistenteSocial}</td>
              {showActions && (
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  <button onClick={() => onEdit(convivente)} className="bg-blue-500 text-white px-2 py-1 rounded border border-blue-700 hover:bg-blue-600 transition-colors mr-2 text-sm">Editar</button>
                  <button onClick={() => onDelete(convivente.id)} className="bg-red-500 text-white px-2 py-1 rounded border border-red-700 hover:bg-red-600 transition-colors text-sm">Deletar</button>
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ConviventesLista;
