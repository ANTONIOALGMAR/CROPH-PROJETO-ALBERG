// frontend/src/components/ProtectedLayout.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedLayoutProps {
  requiredRole?: 'ADMIN' | 'ASSISTENTE' | 'ORIENTADOR';
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ requiredRole }) => {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedLayout: loading =', loading);
  console.log('ProtectedLayout: usuario =', usuario);
  console.log('ProtectedLayout: requiredRole =', requiredRole);
  console.log('ProtectedLayout: current path =', location.pathname);

  if (loading) {
    console.log('ProtectedLayout: Still loading...');
    return <div style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</div>;
  }

  if (!usuario) {
    console.log('ProtectedLayout: No user, redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && usuario.role !== requiredRole) {
    console.log(`ProtectedLayout: User role ${usuario.role} does not match required role ${requiredRole}. Redirecting to login.`);
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedLayout: User authenticated and authorized. Rendering Outlet.');
  return <Outlet />;
};

export default ProtectedLayout;