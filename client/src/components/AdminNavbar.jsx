import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePassword from './ChangePassword';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Code, 
  Calendar,
  Menu,
  X,
  LogOut,
  Settings,
  Lock,
  Home as HomeIcon
} from 'lucide-react';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Problem Management', href: '/admin/problems', icon: FileText },
    { name: 'Submission Management', href: '/admin/submissions', icon: Code },
    { name: 'Contest Management', href: '/admin/contests', icon: Calendar },
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-[#232b3a] border-2 border-[#00ff99] shadow-lg hover:bg-[#181c24] transition"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-[#00ff99]" />
          ) : (
            <Menu className="h-6 w-6 text-[#00ff99]" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#232b3a] border-r-2 border-[#00ff99] shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full font-mono">
          {/* Logo */}
          <div className="w-full flex items-center justify-center py-6 border-b border-[#00ff99] bg-gradient-to-r from-[#181c24] via-[#232b3a] to-[#181c24]">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight select-none">
              &lt;/&gt; CodersToday
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-2 rounded-lg font-bold text-base transition-all duration-150 border-2 ${
                    active
                      ? 'bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] border-[#00cfff] shadow-lg scale-105'
                      : 'text-[#00ff99] border-transparent hover:bg-[#181c24] hover:text-[#00cfff] hover:border-[#00cfff]'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t-2 border-[#00ff99] bg-[#181c24]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00ff99] to-[#00cfff] rounded-full flex items-center justify-center border-2 border-[#00cfff] shadow-lg">
                <span className="text-[#181c24] text-lg font-extrabold">{user?.username ? user.username[0].toUpperCase() : 'A'}</span>
              </div>
              <div>
                <p className="text-base font-extrabold text-[#00ff99]">{user?.username || 'Admin'}</p>
                <p className="text-xs text-[#00cfff]">{user?.role === 'admin' ? 'Administrator' : user?.role || 'User'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center w-full px-4 py-2 rounded-lg font-bold text-base text-[#00ff99] border-2 border-[#00ff99] hover:bg-[#232b3a] hover:text-[#00cfff] hover:border-[#00cfff] transition-all duration-150"
              >
                <Lock className="mr-3 h-4 w-4" />
                Change Password
              </button>
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 rounded-lg font-bold text-base text-red-400 border-2 border-[#00ff99] hover:bg-red-900 hover:text-white hover:border-[#00cfff] transition-all duration-150"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </button>
              <Link
                to="/home"
                className="flex items-center w-full px-4 py-2 rounded-lg font-bold text-base text-[#00cfff] border-2 border-[#00cfff] hover:bg-[#181c24] hover:text-[#00ff99] hover:border-[#00ff99] transition-all duration-150 mt-2"
                style={{ justifyContent: 'center' }}
              >
                <HomeIcon className="mr-3 h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
};

export function Logo() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
      <span style={{ color: '#a259f7', fontWeight: 700, marginRight: 4 }}>&lt;/&gt;</span>
      <span style={{ color: '#f72585', fontWeight: 700 }}>CodersToday</span>
    </span>
  );
}

export default AdminNavbar; 