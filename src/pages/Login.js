// frontend/src/pages/Login.js
// Removida a linha /* global __file_content_url__ */ pois não é mais utilizada com a imagem de placeholder.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Certifique-se de que o caminho está correto

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // Usando a função de login do contexto

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores

    try {
      // ATENÇÃO: Verifique a porta do seu backend!
      const response = await fetch('http://localhost:3001/api/login', {
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
      

      login(data.user, data.token); // Atualiza o contexto de autenticação com user e token

      // Redireciona com base na role
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
        // Usando uma URL de imagem de placeholder
        // Para usar sua imagem real, você precisaria hospedá-la em um serviço de imagens
        // e substituir esta URL pela URL pública da sua imagem.
        backgroundImage: `url('https://placehold.co/1920x1080/ADD8E6/000000?text=Sua+Imagem+Aqui')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat', 
        backgroundColor: '#f0f2f5' 
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
      </div>
    </div>
  );
};

export default Login;
