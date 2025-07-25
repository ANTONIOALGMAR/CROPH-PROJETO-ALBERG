import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ element, role }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/" />;
  }

  if (role && usuario.role !== role) {
    return <Navigate to="/" />;
  }

  return element;
};

export default PrivateRoute;
