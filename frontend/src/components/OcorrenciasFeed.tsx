import React, { useState, useEffect, useCallback } from 'react';
import { useProtectedFetch } from '../hooks/useProtectedFetch';
import { useAuth } from '../context/AuthContext';

// Definição de tipos simplificada
interface User {
  id: string;
  email: string;
  role: string;
  nome: string; // Adicionado 'nome' para consistência
}

interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  autor: User;
}

interface OcorrenciasFeedProps {
  currentUserId: string;
  BASE_BACKEND_URL: string;
}

const OcorrenciasFeed: React.FC<OcorrenciasFeedProps> = ({ currentUserId, BASE_BACKEND_URL }) => {
  // CORREÇÃO: A propriedade é 'usuario', não 'user' no AuthContextType
  const { usuario } = useAuth();
  const { loading, error, fetchData } = useProtectedFetch<Ocorrencia[]>();

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [newTitulo, setNewTitulo] = useState<string>('');
  const [newDescricao, setNewDescricao] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAllOcorrencias = useCallback(async () => {
    const data = await fetchData(`${BASE_BACKEND_URL}/api/ocorrencias`, {});
    if (data) {
      // Ordena as ocorrências pela data em ordem crescente para o feed (mais antigas primeiro)
      const sortedData = data.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      setOcorrencias(sortedData);
    }
  }, [BASE_BACKEND_URL, fetchData]);

  useEffect(() => {
    fetchAllOcorrencias();
  }, [fetchAllOcorrencias]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleSubmitNewOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo.trim() || !newDescricao.trim()) {
      alert('Título e descrição não podem estar vazios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchData(`${BASE_BACKEND_URL}/api/ocorrencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: newTitulo,
          descricao: newDescricao,
        }),
      });

      if (response) {
        setNewTitulo('');
        setNewDescricao('');
        fetchAllOcorrencias(); // Recarrega todas as ocorrências para incluir a nova
      } else {
        alert('Falha ao criar ocorrência.');
      }
    } catch (err: any) { // Adicionei ': any' para o erro
      console.error('Erro ao criar ocorrência:', err);
      alert('Erro ao criar ocorrência. Verifique o console para mais detalhes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOcorrencia = async (ocorrenciaId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta ocorrência?')) {
      try {
        const response = await fetchData(`${BASE_BACKEND_URL}/api/ocorrencias/${ocorrenciaId}`, {
          method: 'DELETE',
        });
        if (response) {
          alert('Ocorrência deletada com sucesso!');
          fetchAllOcorrencias(); // Recarrega as ocorrências
        } else {
          alert('Falha ao deletar ocorrência.');
        }
      } catch (err: any) { // Adicionei ': any' para o erro
        console.error('Erro ao deletar ocorrência:', err);
        alert('Erro ao deletar ocorrência. Verifique o console para mais detalhes.');
      }
    }
  };

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingOcorrencia, setEditingOcorrencia] = useState<Ocorrencia | null>(null);
  const [editedTitulo, setEditedTitulo] = useState<string>('');
  const [editedDescricao, setEditedDescricao] = useState<string>('');

  const handleEditOcorrencia = (ocorrencia: Ocorrencia) => {
    setEditingOcorrencia(ocorrencia);
    setEditedTitulo(ocorrencia.titulo);
    setEditedDescricao(ocorrencia.descricao);
    setIsEditing(true);
  };

  const handleUpdateOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOcorrencia) return;

    if (!editedTitulo.trim() || !editedDescricao.trim()) {
      alert('Título e descrição não podem estar vazios.');
      return;
    }

    try {
      const response = await fetchData(`${BASE_BACKEND_URL}/api/ocorrencias/${editingOcorrencia.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: editedTitulo,
          descricao: editedDescricao,
        }),
      });

      if (response) {
        alert('Ocorrência atualizada com sucesso!');
        setIsEditing(false);
        setEditingOcorrencia(null);
        fetchAllOcorrencias();
      } else {
        alert('Falha ao atualizar ocorrência.');
      }
    } catch (err: any) { // Adicionei ': any' para o erro
      console.error('Erro ao atualizar ocorrência:', err);
      alert('Erro ao atualizar ocorrência. Verifique o console para mais detalhes.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Carregando ocorrências...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-red-600">Erro ao carregar ocorrências: {error}</p>
      </div>
    );
  }

  // CORREÇÃO: Adicionada a tag de fechamento para o div principal
  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 font-inter">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Feed de Ocorrências</h2>

      {/* Área do Feed de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow-md mb-4">
        {ocorrencias.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma ocorrência encontrada. Crie uma!</p>
        ) : (
          ocorrencias.map((ocorrencia) => {
            const isMyMessage = ocorrencia.autor.id === currentUserId;
            const isAdmin = usuario?.role === 'ADMIN'; // Verificar se o usuário é ADMIN

            return (
              <div
                key={ocorrencia.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-sm relative
                    ${isMyMessage ? 'bg-green-200 text-gray-800 rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                >
                  <p className="font-semibold text-sm mb-1">
                    {ocorrencia.titulo}
                  </p>
                  <p className="text-sm">
                    {ocorrencia.descricao}
                  </p>
                  <div className={`text-xs mt-1 ${isMyMessage ? 'text-right' : 'text-left'} text-gray-600`}>
                    <span className="font-medium">
                      {isMyMessage ? 'Você' : ocorrencia.autor.email.split('@')[0]} ({ocorrencia.autor.role})
                    </span>
                    <span className="ml-2">{formatDateTime(ocorrencia.data)}</span>
                  </div>
                  {isAdmin && ( // Mostrar botões apenas para ADMIN
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={() => handleEditOcorrencia(ocorrencia)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteOcorrencia(ocorrencia.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Deletar
                      </button>
                    </div> 
                  )}
                </div> 
              </div> 
            );
          })
        )}
      </div> {/* Fechamento da div do feed de mensagens */}

      {/* Formulário para Nova Ocorrência */}
      <form onSubmit={handleSubmitNewOcorrencia} className="bg-white p-4 rounded-lg shadow-md mt-auto">
        <div className="mb-3">
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
            Título:
          </label>
          <input
            type="text"
            id="titulo"
            value={newTitulo}
            onChange={(e) => setNewTitulo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Título da ocorrência"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição:
          </label>
          <textarea
            id="descricao"
            value={newDescricao}
            onChange={(e) => setNewDescricao(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
            placeholder="Detalhes da ocorrência..."
            required
            disabled={isSubmitting}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Adicionar Ocorrência'}
        </button>
      </form>

      {/* Modal de Edição */}
      {isEditing && editingOcorrencia && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Editar Ocorrência</h3>
            <form onSubmit={handleUpdateOcorrencia}>
              <div className="mb-3">
                <label htmlFor="editTitulo" className="block text-sm font-medium text-gray-700 mb-1">
                  Título:
                </label>
                <input
                  type="text"
                  id="editTitulo"
                  value={editedTitulo}
                  onChange={(e) => setEditedTitulo(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editDescricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição:
                </label>
                <textarea
                  id="editDescricao"
                  value={editedDescricao}
                  onChange={(e) => setEditedDescricao(e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingOcorrencia(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div> // Fechamento da div principal
  );
};

export default OcorrenciasFeed;
