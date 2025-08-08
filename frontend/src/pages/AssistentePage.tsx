// 📁 frontend/src/pages/AssistentePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import PresencaGrid from '../components/PresencaGrid';
import LeitoMapaGrid from '../components/LeitoMapaGrid';
import ConviventeForm from '../components/conviventeForm';
import ConviventesLista from '../components/ConviventesLista';
import OcorrenciaPage from './OcorrenciaPage';
import { useProtectedFetch } from '../hooks/useProtectedFetch';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FormikHelpers } from 'formik';
import { Convivente, ConviventeFormData, ConviventeApiData } from '../types/Convivente';

const AssistentePage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [editingConvivente, setEditingConvivente] = useState<Convivente | null>(null); // Renomeado para clareza
  const [mainTab, setMainTab] = useState<'presenca'|'mapa'|'cadastro'|'lista'|'ocorrencias'>('presenca');
  const [conviventes, setConviventes] = useState<Convivente[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { fetchData } = useProtectedFetch<Convivente[]>();

  const carregarConviventes = useCallback(async () => {
    console.log('AssistentePage: Iniciando carregarConviventes...');
    try {
      const lista = await fetchData(`${process.env.REACT_APP_API_URL}/api/conviventes`);
      console.log('AssistentePage: Dados de conviventes recebidos:', lista);
      if (lista) {
        setConviventes(lista);
      }
    } catch (err) {
      console.error('AssistentePage: Erro ao carregar conviventes:', err);
    }
  }, [fetchData]);

  useEffect(() => { carregarConviventes(); }, [carregarConviventes]);

  const handleRegisterParticipation = async (
    leito: number, tipo: 'PRESENCA', presente: boolean,
    data: string, conviventeId: string | null
  ) => {
    try {
      await fetchData(`${process.env.REACT_APP_API_URL}/api/presenca`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leito, data, presente, conviventeId }),
      });
      carregarConviventes();
    } catch (err) {
      console.error('Erro ao registrar presença', err);
    }
  };

  const handleSubmitConviventeForm = async (values: ConviventeApiData, actions: FormikHelpers<ConviventeFormData>) => {
    const formData = new FormData();

    // Adiciona os campos ao FormData, tratando os tipos
    formData.append('nome', values.nome);
    formData.append('email', values.email || '');
    formData.append('quarto', values.quarto || '');
    formData.append('leito', String(values.leito));
    formData.append('dataNascimento', values.dataNascimento.toISOString());
    formData.append('assistenteSocial', values.assistenteSocial || '');
    formData.append('cpf', values.cpf || '');
    formData.append('rg', values.rg || '');

    if (values.photo instanceof File) {
      formData.append('photo', values.photo);
    }

    try {
      const endpoint = editingConvivente ? `/api/conviventes/${editingConvivente.id}` : '/api/conviventes';
      const method = editingConvivente ? 'PUT' : 'POST';
      await fetchData(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method,
        body: formData, // Envia FormData
        // Não defina Content-Type, o navegador fará isso automaticamente para FormData
      });
      setEditingConvivente(null); // Limpa o convivente em edição
      setMainTab('lista'); // Volta para a lista após salvar
      carregarConviventes();
      actions.resetForm();
    } catch (err: any) { // Adicionado ': any' para tipagem do erro
      console.error('Erro ao salvar convivente', err);
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchData(`${process.env.REACT_APP_API_URL}/api/conviventes/${id}`, { method: 'DELETE' });
      carregarConviventes();
    } catch (err) {
      console.error('Erro ao deletar convivente', err);
    }
  };

  // NOVA FUNÇÃO: Lida com o clique no botão Editar
  const handleEditConvivente = (convivente: Convivente) => {
    setEditingConvivente(convivente); // Define qual convivente está sendo editado
    setMainTab('cadastro'); // Muda para a aba de cadastro/edição
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Página do Assistente</h1>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Logout
        </button>
      </div>
      {/* tabs */}
      <div className="bg-white rounded-lg p-2 flex flex-wrap justify-center sm:justify-start gap-2 mb-6 shadow-md">
        {['presenca','mapa','cadastro','lista','ocorrencias'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setMainTab(t as any)}
            className={`flex-1 sm:flex-none text-center py-2 px-4 rounded-lg font-medium transition-all duration-300 ease-in-out
              ${mainTab === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            { t === 'presenca' ? 'Presença' :
              t === 'mapa' ? 'Mapa de Leitos' :
              t === 'cadastro' ? 'Cadastro' :
              t === 'lista' ? 'Lista' : 'Ocorrências' }
          </button>
        ))}
      </div>

      {/* date picker */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <label htmlFor="data" className="block text-lg font-medium text-gray-700 mb-2">Data:</label>
        <input
          id="data"
          type="date"
          value={dataSelecionada}
          onChange={e => setDataSelecionada(e.currentTarget.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {mainTab === 'presenca' && (
        <PresencaGrid
          conviventes={conviventes}
          dataSelecionada={dataSelecionada}
          onRegisterParticipation={handleRegisterParticipation}
        />
      )}
      {mainTab === 'mapa' && <LeitoMapaGrid conviventes={conviventes} />}
      {mainTab === 'cadastro' && (
        <ConviventeForm
          initialData={editingConvivente || undefined}
          onSubmit={handleSubmitConviventeForm as any}
        />
      )}
      {mainTab === 'lista' && (
        <ConviventesLista
          conviventes={conviventes}
          onEdit={handleEditConvivente} // <-- AGORA PASSA A NOVA FUNÇÃO
          onDelete={handleDelete}
        />
      )}
      {mainTab === 'ocorrencias' && <OcorrenciaPage />}
    </div>
  );
};

export default AssistentePage;
