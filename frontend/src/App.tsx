import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AssistentePage from './pages/AssistentePage';
import OrientadorPage from './pages/OrientadorPage';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import ConviventesPage from './pages/ConviventePage';
import PublicRegister from './pages/PublicRegister'; // Importa a nova página

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota pública para criar o primeiro admin */}
          <Route path="/criar-admin" element={<PublicRegister />} />

          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout requiredRole="ASSISTENTE" />}>
            <Route path="assistente" element={<AssistentePage />} />
          </Route>
          <Route element={<ProtectedLayout requiredRole="ORIENTADOR" />}>
            <Route path="orientador" element={<OrientadorPage />} />
          </Route>
          <Route element={<ProtectedLayout requiredRole="ADMIN" />}>
            <Route index path="admin" element={<AdminPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          </Route>
          {/* A rota /conviventes será acessada diretamente se necessário, ou protegida por uma role específica */}
          <Route path="conviventes" element={<ProtectedLayout requiredRole="ASSISTENTE" />}>
            <Route index element={<ConviventesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;