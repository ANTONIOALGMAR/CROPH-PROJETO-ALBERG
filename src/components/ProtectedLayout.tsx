// frontend/src/components/ProtectedLayout.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedLayout: React.FC = () => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado, renderiza o conteúdo da rota aninhada
  return <Outlet />;
};

export default ProtectedLayout;