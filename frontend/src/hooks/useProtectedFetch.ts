// src/hooks/useProtectedFetch.ts
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // Assumindo que você tem um AuthContext para o token

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: (url: string, options?: RequestInit) => Promise<T | null>;
}

export function useProtectedFetch<T>(initialData: T | null = null): FetchResult<T> {
  const { token, logout } = useAuth(); // Obtenha o token do AuthContext
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (url: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const currentToken = localStorage.getItem('token'); // Pega o token mais recente

      if (!currentToken) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        logout(); // Desloga o usuário se o token estiver ausente
        return null;
      }

      const headers = new Headers(options?.headers || {});
      headers.append('Authorization', `Bearer ${currentToken}`);

      let requestBody = options?.body;
      if (!(options?.body instanceof FormData) && typeof options?.body === 'object' && options?.body !== null) {
        headers.append('Content-Type', 'application/json');
        requestBody = JSON.stringify(options.body);
      }

      let requestUrl = url;
      if (options?.method === 'GET' || !options?.method) {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set('_t', Date.now().toString());
        requestUrl = urlObj.toString();
      }

      const response = await fetch(requestUrl, {
        ...options,
        headers,
        body: requestBody,
      });

      console.log(`useProtectedFetch: Resposta para ${url} - Status: ${response.status}`);

      if (response.status === 401) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        logout(); // Se não autorizado, faz logout
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`useProtectedFetch: Erro na resposta para ${url} - ${response.status}: ${errorText}`);
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
      }

      if (response.status === 204) {
        console.log(`useProtectedFetch: Resposta 204 No Content para ${url}. Retornando null.`);
        setData(null); // Para requisições sem conteúdo de retorno
        return null;
      }

      const result = await response.json();
      console.log(`useProtectedFetch: Dados JSON recebidos para ${url}:`, result);
      setData(result);
      return result; // Retorna os dados para quem chamou
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados.');
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout]); // Dependências do useCallback

  // Retorne o objeto completo com todos os estados e a função
  return { data, loading, error, fetchData };
}
