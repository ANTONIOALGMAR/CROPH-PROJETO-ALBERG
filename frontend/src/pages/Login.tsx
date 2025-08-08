import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password: senha,
      });

      const { token, user } = response.data;

      const usuarioAdaptado = {
        id: user.id,
        nome: user.nome ?? user.email,
        role: user.role, // AGORA É 'role', NÃO 'tipo'
      };

      login(token, usuarioAdaptado);
      navigate('/');
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>

        {erro && <p className="text-red-500 mb-3">{erro}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;