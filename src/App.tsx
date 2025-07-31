import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AssistentePage from './pages/AssistentePage';
import OrientadorPage from './pages/OrientadorPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import ConviventesPage from './pages/ConviventePage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route path="assistente" element={<AssistentePage />} />
            <Route path="orientador" element={<OrientadorPage />} />
            <Route path="conviventes" element={<ConviventesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
