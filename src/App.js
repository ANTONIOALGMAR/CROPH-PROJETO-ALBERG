import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminPage from './pages/AdminPage';
import AssistentePage from './pages/AssistentePage';
import OrientadorPage from './pages/OrientadorPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin"
            element={<PrivateRoute element={<AdminPage />} role="admin" />}
          />
          <Route
            path="/assistente"
            element={<PrivateRoute element={<AssistentePage />} role="assistente" />}
          />
          <Route
            path="/orientador"
            element={<PrivateRoute element={<OrientadorPage />} role="orientador" />}
          />

          <Route
            path="/ocorrencias"
            element={<PrivateRoute element={<OcorrenciasPage />} role="orientador" />}
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
