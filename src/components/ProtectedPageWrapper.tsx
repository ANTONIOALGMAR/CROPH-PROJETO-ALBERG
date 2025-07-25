import React from 'react';

type Props = {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
};

const ProtectedPageWrapper = ({ loading, error, children }: Props) => {
  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">Carregando...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">Erro: {error}</div>
    );
  }

  return <>{children}</>;
};

export default ProtectedPageWrapper;
