// frontend/src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const lastEmail = localStorage.getItem('lastEmail');
    if (lastEmail) {
      setEmail(lastEmail);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao tentar conectar.');
      }

      const data = await response.json();
      
      localStorage.setItem('lastEmail', email);
      login(data.token, { ...data.user, role: data.user.role });

      // Limpa os campos após o login bem-sucedido
      setEmail('');
      setPassword('');

      console.log('Login bem-sucedido. Redirecionando para:', data.user.role);
      if (data.user.role === 'ASSISTENTE') {
        navigate('/assistente');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (data.user.role === 'ORIENTADOR') {
        navigate('/orientador');
      } else {
        setError('Role de usuário desconhecida.');
      }

    } catch (err) {
      console.error('Erro de rede ou ao tentar login:', err);
      setError(err.message || 'Ocorreu um erro ao tentar conectar. Tente novamente mais tarde.');
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#ADD8E6' 
      }}
    >
      <div 
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          padding: '40px', 
          borderRadius: '10px', 
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', 
          maxWidth: '400px', 
          width: '100%', 
          textAlign: 'center' 
        }}
      >
        <img src="/logo.png" alt="Logotipo" style={{ maxWidth: '150px', marginBottom: '10px' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>CROPH - CTA PRATES 1</h1>
        <h2 style={{ marginBottom: '25px', color: '#333' }}>Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', textAlign: 'left' }}>
              Usuário (Email):
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ccc', 
                borderRadius: '5px', 
                fontSize: '1em' 
              }}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', textAlign: 'left' }}>
              Senha:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ccc', 
                borderRadius: '5px', 
                fontSize: '1em' 
              }}
            />
          </div>
          {error && <p style={{ color: '#dc3545', marginTop: '10px', fontSize: '0.9em' }}>{error}</p>}
          <button 
            type="submit" 
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer', 
              fontSize: '1.1em', 
              fontWeight: 'bold', 
              marginTop: '20px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Entrar
          </button>
        </form>
        <footer style={{ marginTop: '30px', fontSize: '0.8rem', color: '#666' }}>
          <p>Engenheiro de Software: ANTONIO ALGMAR</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;