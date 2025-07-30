// frontend/src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  id: string;
  email?: string;
  role: 'ADMIN' | 'ASSISTENTE' | 'ORIENTADOR';
}

const Login: React.FC = () => {
  const { login, usuario } = useAuth(); // Pegamos o usuário do contexto
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);

  // useEffect para reagir à mudança de estado de autenticação
  useEffect(() => {
    if (usuario) {
      const rota =
        usuario.role === 'ADMIN'
          ? '/admin'
          : usuario.role === 'ASSISTENTE'
          ? '/assistente'
          : '/orientador';
      navigate(rota, { replace: true });
    }
  }, [usuario, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    console.log('Login.tsx: handleLogin executado.');
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
        login: loginValue,
        senha: senha,
      });
      console.log('Login.tsx: Resposta completa do backend:', res.data);

      const token: string = res.data.token;
      console.log('Login.tsx: Token recebido do backend:', res.data.token);
      console.log('Login.tsx: Token antes de chamar login():', token);
      const decoded = jwtDecode<JwtPayload>(token);
      const userData = {
        id: decoded.id,
        email: decoded.email || '',
        role: decoded.role,
      };

      // Apenas chamamos o login, o useEffect cuidará da navegação
      login(userData, token);

    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.response?.data?.msg || 'Erro ao efetuar login.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded bg-white shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">Usuário</label>
          <input
            type="text"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            required
            className="w-full p-2 border rounded"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block mb-1">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full p-2 border rounded"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;
