import React from 'react';

interface User {
  id: string;
  email: string;
  nome: string;
  role: 'ADMIN' | 'ASSISTENTE' | 'ORIENTADOR';
}

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  loading: boolean;
  error: string | null;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, loading, error }) => {
  if (loading) {
    return <div className="text-center py-4">Carregando usuários...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Erro ao carregar usuários: {error}</div>;
  }

  if (users.length === 0) {
    return <div className="text-center py-4">Nenhum usuário encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left">Nome</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Função</th>
            <th className="py-3 px-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{user.nome}</td>
              <td className="py-3 px-4">{user.email}</td>
              <td className="py-3 px-4">{user.role}</td>
              <td className="py-3 px-4">
                <button onClick={() => onEdit(user)} className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2">Editar</button>
                <button onClick={() => onDelete(user.id)} className="bg-red-500 text-white px-3 py-1 rounded-md">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;