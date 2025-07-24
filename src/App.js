import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminPage from './pages/AdminPage'; // Componente para a página do admin
import AssistentePage from './pages/AssistentePage'; // Componente para a página do assistente
import OrientadorPage from './pages/OrientadorPage'; // Componente para a página do orientador

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/assistente" element={<AssistentePage />} />
        <Route path="/orientador" element={<OrientadorPage />} />
      </Routes>
    </Router>
  );
};

export default App;