// Em src/pages/OrientadorPage.jsx
import React, { useState, useEffect } from 'react';
import OrientadorConviventes from '../components/OrientadorConviventes';

const OrientadorPage = () => {
  const [cadastros, setCadastros] = useState([]);

  useEffect(() => {
  fetch('http://localhost:5000/api/conviventes')
    .then(r => r.json())
    .then(data => setCadastros(data));
}, []);


  return (
    <div>
      <h1>Orientador</h1>
      <OrientadorConviventes cadastros={cadastros} />
    </div>
  );
};

export default OrientadorPage;

