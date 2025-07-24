// Em src/pages/OrientadorPage.jsx
import React, { useState, useEffect } from 'react';
import OrientadorConviventes from '../components/OrientadorConviventes';

const OrientadorPage = () => {
  const [cadastros, setCadastros] = useState([]);

  useEffect(() => {
    // Buscar dados da API, ou usar estado inicial
    setCadastros([
      { leito: 2, nome: 'Ana Souza' },
      { leito: 5, nome: 'Carlos Lima' },
    ]);
  }, []);

  return (
    <div>
      <h1>Orientador</h1>
      <OrientadorConviventes cadastros={cadastros} />
    </div>
  );
};

export default OrientadorPage;

