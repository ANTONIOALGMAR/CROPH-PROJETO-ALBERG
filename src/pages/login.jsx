import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/api/login', {
      login: 'usuario',
      senha: 'senha',
    });
    login(res.data.token);

    const decoded = JSON.parse(atob(res.data.token.split('.')[1]));
    const rota = decoded.role === 'admin'
      ? '/admin'
      : decoded.role === 'assistente'
      ? '/assistente'
      : '/orientador';
    
    navigate(rota);
  };

  return (
    <form onSubmit={handleLogin}>
      {/* campos */}
      <button type="submit">Entrar</button>
    </form>
  );
};
export default Login;
