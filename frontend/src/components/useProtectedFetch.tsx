import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from '../context/AuthContext';

interface UseProtectedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
}

const useProtectedFetch = <T,>(): UseProtectedFetchResult<T> => {
  const { token, logout } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (url: string, config?: AxiosRequestConfig): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return null;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...config?.headers,
      };

      const response = await axios({
        url,
        ...config,
        headers,
      });

      setData(response.data);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Sessão expirada ou não autorizada. Faça login novamente.');
          logout(); // Só desloga se receber 401 com token
        } else {
          setError(err.message || `Erro: ${err.response.status}`);
        }
      } else {
        setError(err.message || 'Erro desconhecido');
      }
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  return { data, loading, error, fetchData };
};

export default useProtectedFetch;