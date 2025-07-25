import { useCallback, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function useProtectedFetch<T>(url: string) {
  const { token } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<T>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  return { data, loading, error, refetch: fetchData };
}
