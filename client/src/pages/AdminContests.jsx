import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

const AdminContests = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    const handlePopState = () => {
      navigate('/home', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Contest Management</h1>
        <p className="text-gray-600">This is the admin contest management page. Implement contest management features here.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminContests; 