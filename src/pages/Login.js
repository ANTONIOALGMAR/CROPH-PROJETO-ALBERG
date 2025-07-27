import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState(''); // Este campo será o EMAIL
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => { // Tornar a função assíncrona
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    try {
      const response = await fetch('http://localhost:3001/api/login', { // <--- ENDPOINT DO SEU BACKEND
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ // Envia o email (username) e a senha
          email: username,    // O backend espera 'email'
          password: password, // O backend espera 'password'
        }),
      });

      const data = await response.json();

      if (response.ok) { // Se a resposta for 2xx (sucesso)
        // Autenticação bem-sucedida
        // O backend deve retornar um token JWT e/ou informações do usuário
        // Você deve armazenar o token (ex: localStorage)
        localStorage.setItem('token', data.token); 
        // Você pode também armazenar informações do usuário, se retornadas
        // localStorage.setItem('userRole', data.user.role); 

        // Redirecionar baseado no papel (role) do usuário retornado pelo backend
        switch (data.user.role) { // Supondo que o backend retorna data.user.role
          case 'ADMIN': // Use os nomes de role do seu ENUM do Prisma (maiúsculas)
            navigate('/admin');
            break;
          case 'ORIENTADOR':
            navigate('/orientador');
            break;
          case 'ASSISTENTE':
            navigate('/assistente');
            break;
          default:
            navigate('/'); // Rota padrão se o role não for reconhecido
        }
      } else {
        // Autenticação falhou (ex: status 401 Unauthorized)
        setError(data.message || 'Nome de usuário ou senha inválidos.'); // Mensagem de erro do backend
      }
    } catch (err) {
      console.error('Erro de rede ou ao tentar login:', err);
      setError('Ocorreu um erro ao tentar conectar. Tente novamente mais tarde.');
    }
  };

  return (
    <div>
      <h2>Tela de Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Usuário (Email):</label> {/* Sugestão de mudar o label */}
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