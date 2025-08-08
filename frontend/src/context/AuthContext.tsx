// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Usuario {
  id: string;
  nome: string;
  role: 'ADMIN' | 'ASSISTENTE' | 'ORIENTADOR';
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('usuario');
        if (savedToken && savedUser && savedUser !== 'undefined') {
      try {
        setToken(savedToken);
        setUsuario(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erro ao parsear usuário do localStorage:", error);
        // Limpa dados inválidos para evitar loops de erro
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, usuario: Usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setToken(token);
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook personalizado corretamente definido e exportado
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
