import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProtectedFetch } from '../hooks/useProtectedFetch';
import { format } from 'date-fns';
import { Convivente, Usuario } from '../types/index';

// Importar componentes
import PresencaGrid from '../components/PresencaGrid';
import LeitoMapaGrid from '../components/LeitoMapaGrid';
import RefeicaoGrid from '../components/RefeicaoGrid';
import ConviventesLista from '../components/ConviventesLista';
import { UserRegistrationForm, UserRegistrationFormData } from '../components/UserRegistrationForm'; // Importar UserRegistrationForm
import { FormikHelpers } from 'formik'; // Importar FormikHelpers
import OcorrenciasFeed from '../components/OcorrenciasFeed'; // Importar OcorrenciasFeed
import UserList from '../components/UserList'; // Importar UserList
import CardsDashboard from '../components/dashboard/CardsDashboard'; // Importar CardsDashboard

const AdminPage = () => {
  const { usuario, token: jwtToken, loading: authLoading } = useAuth();
  const { fetchData } = useProtectedFetch();
  const navigate = useNavigate();

  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mainTab, setMainTab] = useState('dashboard'); // Definir dashboard como aba inicial
  const [refeicaoTab, setRefeicaoTab] = useState('cafe');
    const [editingUser, setEditingUser] = useState<UserRegistrationFormData | (Usuario & { password?: string }) | null>(null);
  const [, setDashboardKey] = useState(0);

  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchData(`${BASE_BACKEND_URL}/api/users`);
      setUsers(data as any[]);
    } catch (err: any) {
      setErrorUsers(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [BASE_BACKEND_URL, fetchData]);

  const fetchConviventes = useCallback(async () => {
    console.log('AdminPage: Iniciando fetchConviventes...');
    try {
      const data = await fetchData(`${BASE_BACKEND_URL}/api/conviventes`);
      console.log('AdminPage: Dados de conviventes recebidos:', data);
      setConviventes(data as Convivente[]);
    } catch (err: any) {
      console.error('AdminPage: Erro ao buscar conviventes:', err);
      setConviventes([]);
    }
  }, [BASE_BACKEND_URL, fetchData]);

  useEffect(() => {
    if (!authLoading && !jwtToken) {
      navigate('/login');
    }
    if (jwtToken) {
      fetchConviventes();
      fetchUsers();
    }
  }, [jwtToken, authLoading, navigate, fetchUsers, fetchConviventes]);

  const handleRegisterParticipation = useCallback(
    async (leito: number, tipoEvento: string, participou: boolean, dataEvento: string) => {
      console.log(`handleRegisterParticipation: Chamada para leito ${leito}, tipo ${tipoEvento}, participou ${participou}, data ${dataEvento}`);
      const conviv = conviventes.find((c) => c.leito === leito);
      const conviventeId = conviv ? conviv.id : null;
      let url: string;
      let bodyContent: any; // Usar um nome diferente para evitar conflito com 'body' do fetch

      if (tipoEvento === 'PRESENCA') {
        url = `${BASE_BACKEND_URL}/api/presenca`;
        bodyContent = { leito, data: dataEvento, conviventeId, presente: participou }; 
      } else {
        url = `${BASE_BACKEND_URL}/api/participacao-refeicao`;
        bodyContent = {
          leito: parseInt(String(leito)), // Garante que leito seja number
          data: dataEvento,
          tipo: tipoEvento,
          participou,
          conviventeId: conviventeId,
        };
      }

      console.log("Payload enviado:", bodyContent);

      try {
        await fetchData(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyContent),
        });
        setDashboardKey(prevKey => {
          const newKey = prevKey + 1;
          console.log(`DashboardKey atualizada para: ${newKey}`);
          return newKey;
        }); // Atualiza a chave do dashboard
      } catch (error: any) {
        console.error('Erro ao registrar participação:', error);
      }
    },
    [conviventes, BASE_BACKEND_URL, fetchData]
  );

  const handleSubmitUser = async (values: UserRegistrationFormData, actions: FormikHelpers<UserRegistrationFormData>) => {
                        const url = (editingUser && 'id' in editingUser && editingUser.id)
      ? `${BASE_BACKEND_URL}/api/users/${(editingUser as Usuario).id}`
      : `${BASE_BACKEND_URL}/api/users`;

    try {
      const method = (editingUser && 'id' in editingUser && editingUser.id) ? 'PUT' : 'POST';
      await fetchData(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      actions.setSubmitting(false);
      setEditingUser(null);
      fetchUsers();
      setMainTab('listaUsuarios');
    } catch (error: any) {
      actions.setSubmitting(false);
      actions.setStatus({ error: error.message });
    }
  };

  const handleEditUser = (user: UserRegistrationFormData | Usuario) => {
    setEditingUser(user);
    setMainTab('cadastroUsuarios');
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await fetchData(`${BASE_BACKEND_URL}/api/users/${userId}`, { method: 'DELETE' });
        alert('Usuário excluído com sucesso!');
        fetchUsers(); // Recarrega a lista de usuários
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        alert(`Erro ao excluir usuário: ${error.message}`);
      }
    }
  };

  return (
    <div className="bg-blue-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho com saudação ao usuário */}
        <div className="flex justify-between items-center mb-8">
          <img src="/logo.png" alt="Logotipo" className="h-16" />
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Olá, {usuario?.nome || 'Administrador'}</span>
            <button
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Menu de abas */}
        <div className="bg-gray-200 rounded-lg p-2 flex space-x-2 mb-8">
          <button
            onClick={() => setMainTab('dashboard')}
            className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'dashboard' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setMainTab('presenca')}
            className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'presenca' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
          >
            Presença
          </button>
          <button
            onClick={() => setMainTab('refeicoes')}
            className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'refeicoes' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
          >
            Refeições
          </button>
          <button
            onClick={() => setMainTab('lista')}
            className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'lista' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
          >
            Lista de Conviventes
          </button>
          <button
            onClick={() => setMainTab('mapa')}
            className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'mapa' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
          >
            Mapa de Leitos
          </button>
          <button
            onClick={() => setMainTab('ocorrencias')}
            className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'ocorrencias' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
          >
            Ocorrências
          </button>
          <button
            onClick={() => setMainTab('cadastroUsuarios')}
            className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'cadastroUsuarios' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
          >
            Cadastro de Usuários
          </button>
          <button
            onClick={() => setMainTab('listaUsuarios')}
            className={`flex-1 text-center py-3 rounded-lg ${mainTab === 'listaUsuarios' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
          >
            Lista de Usuários
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {mainTab === 'dashboard' && (
            <CardsDashboard />
          )}

          {mainTab === 'presenca' && (
            <PresencaGrid
              conviventes={conviventes.map(c => ({
                ...c,
                cpf: c.cpf ?? '',
                quarto: c.quarto ?? '',
                assistenteSocial: c.assistenteSocial ?? '',
                photoUrl: c.photoUrl ?? '',
                rg: c.rg ?? '',
              }))}
              dataSelecionada={selectedDate}
              onRegisterParticipation={handleRegisterParticipation}
            />
          )}

          {mainTab === 'refeicoes' && (
            <div>
              <div className="mb-5 text-center">
                <label>Data do Evento:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="ml-2 p-2 border rounded"
                />
              </div>
              <div className="bg-gray-200 rounded-lg p-2 flex space-x-2 mb-8">
                <button
                  onClick={() => setRefeicaoTab('cafe')}
                  className={`flex-1 text-center py-3 rounded-lg ${refeicaoTab === 'cafe' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
                >
                  Café da Manhã
                </button>
                <button
                  onClick={() => setRefeicaoTab('almoco')}
                  className={`flex-1 text-center py-3 rounded-lg ${refeicaoTab === 'almoco' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
                >
                  Almoço
                </button>
                <button
                  onClick={() => setRefeicaoTab('jantar')}
                  className={`flex-1 text-center py-3 rounded-lg ${refeicaoTab === 'jantar' ? 'bg-white shadow' : 'hover:bg-gray-300'} transition-colors`}
                >
                  Jantar
                </button>
              </div>
              <RefeicaoGrid
                tipoRefeicao={refeicaoTab.toUpperCase() as 'CAFE' | 'ALMOCO' | 'JANTAR'}
                conviventes={conviventes}
                dataSelecionada={selectedDate}
                onRegisterParticipation={handleRegisterParticipation}
              />
            </div>
          )}

          {mainTab === 'lista' && (
            <ConviventesLista
              conviventes={conviventes.map(c => ({
                ...c,
                cpf: c.cpf ?? '',
                quarto: c.quarto ?? '',
                assistenteSocial: c.assistenteSocial ?? '',
                photoUrl: c.photoUrl ?? '',
                rg: c.rg ?? '',
              }))}
            />
          )}

          {mainTab === 'mapa' && (
            <LeitoMapaGrid
              conviventes={conviventes.map(c => ({
                ...c,
                cpf: c.cpf ?? '',
                quarto: c.quarto ?? '',
                assistenteSocial: c.assistenteSocial ?? ''
              }))}
            />
          )}

          {mainTab === 'ocorrencias' && (
            <OcorrenciasFeed
              currentUserId={usuario?.id || ''}
              BASE_BACKEND_URL={BASE_BACKEND_URL || ''}
            />
          )}

          {mainTab === 'cadastroUsuarios' && (
            <UserRegistrationForm
              onSubmit={handleSubmitUser}
              initialData={
                editingUser
                  ? ('email' in editingUser && 'role' in editingUser
                      ? editingUser
                      : {
                          email: (editingUser as Usuario).email || '',
                          nome: (editingUser as Usuario).nome || '',
                          role: (editingUser as any).role || '',
                          password: (editingUser as any).password || '',
                        })
                  : null
              }
              onCancel={() => setEditingUser(null)}
            />
          )}

          {mainTab === 'listaUsuarios' && (
            <UserList
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              loading={loadingUsers}
              error={errorUsers}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;