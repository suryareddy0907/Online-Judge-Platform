import React, { useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = (e) => {
      // Only redirect if we're in an /admin route
      if (location.pathname.startsWith('/admin')) {
        navigate('/home', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminNavbar />
      <main className="flex-1 overflow-auto lg:ml-64">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout; 