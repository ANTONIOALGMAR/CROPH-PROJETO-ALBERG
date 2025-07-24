import React from 'react';

const OrientadorConviventes = ({ cadastros }) => {
  // Verificação se cadastros é um array
  const list = Array.isArray(cadastros) ? cadastros : [];

  // Ordena a lista de cadastros pelo número do leito
  const sorted = list.sort((a, b) => a.leito - b.leito);

  return (
    <table>
      <thead>
        <tr><th>Leito</th><th>Foto</th><th>Nome</th></tr>
      </thead>
      <tbody>
        {sorted.map((c, i) => (
          <tr key={i}>
            <td>{c.leito}</td>
            <td>
              {c.photoUrl && (
                <img src={c.photoUrl} alt={c.nome} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }} />
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

