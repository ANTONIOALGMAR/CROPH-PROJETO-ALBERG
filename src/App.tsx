// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminPage from './pages/AdminPage';
import AssistentePage from './pages/AssistentePage';
import OrientadorPage from './pages/OrientadorPage'; // Já está importado
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import OcorrenciasPage from './pages/OcorrenciaPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin"
            element={<PrivateRoute element={<AdminPage />} role="ADMIN" />} // Role em maiúsculas
          />
          <Route
            path="/assistente"
            element={<PrivateRoute element={<AssistentePage />} role="ASSISTENTE" />} // Role em maiúsculas
          />
          <Route
            path="/orientador"
            element={<PrivateRoute element={<OrientadorPage />} role="ORIENTADOR" />} // Role em maiúsculas
          />

          <Route
            path="/ocorrencias"
            element={<PrivateRoute element={<OcorrenciasPage />} role="ORIENTADOR" />} // Role em maiúsculas
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;