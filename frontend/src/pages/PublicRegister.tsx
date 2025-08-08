import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormikHelpers } from 'formik';
import UserRegistrationForm, { UserRegistrationFormData } from '../components/UserRegistrationForm';

const PublicRegister: React.FC = () => {
  const navigate = useNavigate();
  const BASE_BACKEND_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (values: UserRegistrationFormData, actions: FormikHelpers<UserRegistrationFormData>) => {
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        // Exibe o erro detalhado vindo do backend
        alert(`Erro ao registrar: ${data.message} - ${data.details || ''}`);
        throw new Error(data.message || 'Erro ao registrar usuário');
      }

      alert('Usuário administrador criado com sucesso! Você será redirecionado para a página de login.');
      navigate('/login');

    } catch (error) {
      console.error('Falha no registro:', error);
      actions.setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Criar Usuário Administrador Inicial</h1>
        <p className="text-center text-sm text-gray-600">Use este formulário para criar o primeiro usuário do sistema. Após a criação, esta página deve ser removida.</p>
        <UserRegistrationForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default PublicRegister;
