import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  getAllUsers, 
  updateUserRole, 
  toggleUserBan, 
  deleteUser,
  updateUserDetails
} from '../services/adminService';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Ban,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });
  const [editUserId, setEditUserId] = useState(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const searchDebounceRef = useRef();
  const navigate = useNavigate();
  const { logout, user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [filters.page]);

  useEffect(() => {
    const handlePopState = () => {
      navigate('/home', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(filters);
      setUsers(data.users);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      fetchUsers(); // Refresh the list
      setShowActions(null);
      // If the current user changed their own role, force logout
      if (currentUser && currentUser.userId === userId) {
        setTimeout(() => {
          alert('Your role has changed. Please log in again.');
          logout();
        }, 500);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBanToggle = async (userId, isBanned) => {
    try {
      await toggleUserBan(userId, isBanned);
      fetchUsers(); // Refresh the list
      setShowActions(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (userEmail === "suryareddy0907@gmail.com") {
      setError("Cannot delete the default admin user.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId);
      fetchUsers(); // Refresh the list
      setShowActions(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (user) => {
    setEditUserId(user._id);
    setEditForm({ username: user.username, email: user.email });
    setEditError('');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUserId(null);
    setEditForm({ username: '', email: '' });
    setEditError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await updateUserDetails(editUserId, editForm);
      closeEditModal();
      fetchUsers();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      moderator: 'bg-yellow-100 text-yellow-800',
      user: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (user) => {
    if (user.isBanned) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Ban className="w-3 h-3 mr-1" />
          Banned
        </span>
      );
    }
    if (!user.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <UserX className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  const CodeBackground = () => (
    <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-30">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="usersCodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff99" />
            <stop offset="100%" stopColor="#00cfff" />
          </linearGradient>
        </defs>
        <text x="50%" y="20%" textAnchor="middle" fontSize="2.5rem" fill="url(#usersCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"// User Management"}</text>
        <text x="50%" y="40%" textAnchor="middle" fontSize="2.5rem" fill="url(#usersCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"function manageUsers() { }"}</text>
      </svg>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-full bg-[#181c24]">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-transparent border-b-transparent border-l-[#00ff99] border-r-[#00cfff] shadow-lg" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}></div>
          <span className="mt-8 text-[#00ff99] font-mono text-lg tracking-widest animate-pulse drop-shadow-lg">Loading Users...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ background: '#181c24', fontFamily: 'Fira Mono, monospace' }}>
        <CodeBackground />
        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight mb-1">User Management</h1>
            <p className="text-[#baffea] font-mono">Manage all registered users</p>
          </div>

          {/* Filters */}
          <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 mb-6 font-mono text-white hover:border-[#00ff99] transition-all grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-base font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-wide mb-2" style={{ fontFamily: 'Fira Mono, monospace', letterSpacing: '0.08em' }}>
                Search
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  placeholder="Search users"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchUsers();
                    }
                  }}
                  className="pl-10 w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-extrabold bg-gradient-to-r from-[#00cfff] to-[#00ff99] text-transparent bg-clip-text tracking-wide mb-2" style={{ fontFamily: 'Fira Mono, monospace', letterSpacing: '0.08em' }}>
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono shadow-inner placeholder-[#baffea] transition"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-wide mb-2" style={{ fontFamily: 'Fira Mono, monospace', letterSpacing: '0.08em' }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono shadow-inner placeholder-[#baffea] transition"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchUsers}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg overflow-hidden font-mono">
            <div className="px-6 py-4 border-b-2 border-[#00cfff] bg-gradient-to-r from-[#181c24] to-[#232b3a]">
              <h3 className="text-lg font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">
                Users ({pagination.total})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#00cfff]">
                <thead className="bg-[#181c24]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#232b3a] divide-y divide-[#00cfff]">
                  {users.map((user, idx) => (
                    <tr key={user._id} className={idx % 2 === 0 ? 'bg-[#232b3a] hover:bg-[#181c24]' : 'bg-[#181c24] hover:bg-[#232b3a]'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-base font-extrabold text-[#00ff99]">
                            {user.username}
                            {user.email === "suryareddy0907@gmail.com" && (
                              <span className="ml-2 px-2 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[#00cfff]">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#baffea]">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button onClick={() => openEditModal(user)} className="px-2 py-1 rounded bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-bold shadow hover:from-[#00cfff] hover:to-[#00ff99] transition-all">Edit</button>
                        {user._id !== (currentUser?.userId) && (
                          <>
                            <button onClick={() => handleDeleteUser(user._id, user.email)} className="px-2 py-1 rounded bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow hover:from-red-500 hover:to-pink-500 transition-all">Delete</button>
                            <select
                              value={user.role}
                              onChange={e => handleRoleUpdate(user._id, e.target.value)}
                              className="px-2 py-1 rounded border-2 border-[#00cfff] bg-[#232b3a] text-[#00cfff] font-bold focus:outline-none focus:ring-2 focus:ring-[#00ff99] font-mono transition"
                              style={{ minWidth: 90 }}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleBanToggle(user._id, !user.isBanned)}
                              className={`px-2 py-1 rounded font-bold border-2 ${user.isBanned ? 'bg-gradient-to-r from-green-500 to-green-700 text-white border-green-400 hover:from-green-700 hover:to-green-500' : 'bg-gradient-to-r from-yellow-500 to-red-500 text-white border-yellow-400 hover:from-red-500 hover:to-yellow-500'} transition-all`}
                              title={user.isBanned ? 'Unban User' : 'Ban User'}
                            >
                              {user.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit User Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-[#181c24]/90 flex items-center justify-center z-50">
              <div className="relative w-full max-w-md mx-4 mt-16 mb-10 p-8 rounded-2xl border-2 border-[#00ff99] bg-[#232b3a] shadow-2xl font-mono overflow-y-auto max-h-[90vh]" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}>
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-6 text-center tracking-tight">Edit User</h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#00ff99] mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleEditChange}
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#00ff99] mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                      required
                    />
                  </div>
                  {editError && (
                    <div className="bg-red-900/80 border border-red-400 rounded-md p-2 text-red-200 text-sm font-mono">{editError}</div>
                  )}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="flex-1 px-4 py-2 border-2 border-[#00cfff] rounded-md text-sm font-bold text-[#00cfff] bg-[#181c24] hover:bg-[#232b3a] focus:outline-none focus:ring-2 focus:ring-[#00ff99] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 px-4 py-2 border-2 border-[#00ff99] rounded-md text-sm font-bold text-[#181c24] bg-gradient-to-r from-[#00ff99] to-[#00cfff] hover:from-[#00cfff] hover:to-[#00ff99] focus:outline-none focus:ring-2 focus:ring-[#00ff99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers; 