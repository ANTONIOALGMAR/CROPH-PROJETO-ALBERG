import React from 'react';

const OrientadorConviventes = ({ cadastros }) => {
  const list = Array.isArray(cadastros) ? cadastros : [];
  const sorted = list.sort((a, b) => a.leito - b.leito);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Leito</th>
          <th>Foto</th>
          <th>Nome</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((c, i) => (
          <tr key={c._id || i}>
            <td>{c.leito}</td>
            <td>
              {c.photoUrl ? (
                <img
                  src={c.photoUrl}
                  alt={c.nome}
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
              ) : (
                <div style={{ width: 50, height: 50 }} />
              )}
            </td>
            <td>{c.nome}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrientadorConviventes;


