import { useEffect, useState } from 'react';
import axios from 'axios';
//import * as jwt_decode from 'jwt-decode'; 
import { useAuth } from '../context/AuthContext';

export const useProtectedFetch = (url: string) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Se quiser decodificar o token, faça assim:
        // const decodedToken = jwt_decode.default(token);

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, token]);

  return { data, loading, error };
};
