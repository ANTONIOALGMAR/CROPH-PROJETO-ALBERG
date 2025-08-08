import React from 'react';
import CardsDashboard from '../components/dashboard/CardsDashboard';

const DashboardPage = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <CardsDashboard />
    </div>
  );
};

export default DashboardPage;