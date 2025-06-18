import React from 'react';
import AdminNavbar from './AdminNavbar';

const AdminLayout = ({ children }) => {
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