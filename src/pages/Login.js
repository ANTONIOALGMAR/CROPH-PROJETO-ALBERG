import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simulação de autenticação
    if (username === 'admin' && password === 'admin123') {
      navigate('/admin');
    } else if (username === 'assistente' && password === 'assistente123') {
      navigate('/assistente');
    } else if (username === 'orientador' && password === 'orientador123') {
      navigate('/orientador');
    } else {
      setError('Nome de usuário ou senha incorretos.');
    }
  };

  return (
    <div>
      <h2>Tela de Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Usuário:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Senha:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;