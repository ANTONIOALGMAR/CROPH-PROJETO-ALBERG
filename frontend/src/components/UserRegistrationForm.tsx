import React from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as yup from 'yup';

interface UserRegistrationFormProps {
  onSubmit: (values: UserRegistrationFormData, actions: FormikHelpers<UserRegistrationFormData>) => void | Promise<any>;
  onCancel?: () => void;
  initialData?: UserRegistrationFormData | null;
}

export interface UserRegistrationFormData {
  nome: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'ASSISTENTE' | 'ORIENTADOR';
}

const validationSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  role: yup.string().oneOf(['ADMIN', 'ASSISTENTE', 'ORIENTADOR']).required('Função é obrigatória'),
});

export const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const initialValues: UserRegistrationFormData = initialData || {
    nome: '',
    email: '',
    password: '',
    role: 'ASSISTENTE',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4 p-6 bg-white rounded-lg shadow-md">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome:</label>
            <Field
              id="nome"
              name="nome"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <ErrorMessage name="nome" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <Field
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha (deixe em branco para não alterar):</label>
            <Field
              id="password"
              name="password"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Função:</label>
            <Field
              as="select"
              id="role"
              name="role"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="ASSISTENTE">Assistente</option>
              <option value="ORIENTADOR">Orientador</option>
              <option value="ADMIN">Admin</option>
            </Field>
            <ErrorMessage name="role" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : (initialData ? 'Atualizar Usuário' : 'Registrar Usuário')}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
              >
                Cancelar
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default UserRegistrationForm;