// frontend/src/context/AuthContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface UserData {
  id: string;
  email: string;
  role: 'ADMIN' | 'ASSISTENTE' | 'ORIENTADOR';
}

interface JwtPayload {
  exp: number;
  // inclua outros campos se existirem
  role?: string;
  id?: string;
  email?: string;
}

interface AuthContextType {
  usuario: UserData | null;
  token: string | null;
  loading: boolean;
  login: (userData: UserData, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  console.log('AuthContext: Initial state - usuario:', usuario, 'token:', token, 'loading:', loading);

  useEffect(() => {
    // configura axios para anexar header Authorization em todas as requisições
    axios.interceptors.request.use(
      (config) => {
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }, [token]);

  const loadUserFromToken = () => {
    console.log('AuthContext: loadUserFromToken called.');
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log('AuthContext: storedToken:', storedToken, 'storedUser:', storedUser);

      // Verifica se o token existe, é uma string e tem o formato de um JWT (3 partes separadas por '.')
      if (storedToken && typeof storedToken === 'string' && storedToken.split('.').length === 3 && storedUser) {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        console.log('AuthContext: decoded JWT:', decoded);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          console.warn('Token expirado.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUsuario(null);
          setToken(null);
          navigate('/login');
        } else {
          console.log('AuthContext: Setting user and token from storage.');
          setUsuario(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } else {
        console.log('AuthContext: No valid token or user in storage.');
        setUsuario(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Erro ao decodificar token:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUsuario(null);
      setToken(null);
    } finally {
      console.log('AuthContext: Setting loading to false.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const login = (userData: UserData, token: string) => {
    console.log('AuthContext: login called with userData:', userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUsuario(userData);
    setToken(token);
  };

  const logout = () => {
    console.log('AuthContext: logout called.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsuario(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve estar dentro de AuthProvider');
  return context;
};

