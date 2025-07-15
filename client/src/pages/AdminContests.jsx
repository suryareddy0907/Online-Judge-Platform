import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllContests, createContest, updateContest, deleteContest, getAllProblems, getAllUsers } from '../services/adminService';
import { Calendar, Plus, Edit, Trash2, Eye, EyeOff, Clock, Users } from 'lucide-react';

const AdminContests = () => {
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    problems: [],
    isPublic: false,
    allowedUsers: []
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    problems: [],
    isPublic: false,
    allowedUsers: []
  });

  useEffect(() => {
    fetchContests();
    fetchProblems();
    fetchUsers();
  }, [filters]);

  const fetchContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContests(filters);
      setContests(data.contests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const data = await getAllProblems({ forContest: true });
      setProblems(data.problems || []);
    } catch (err) {
      console.error('Error fetching problems:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch all users for the private contest user selection
      const data = await getAllUsers({ limit: 0 }); // limit 0 to get all users
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContest(createForm);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problems: [],
        isPublic: false,
        allowedUsers: []
      });
      fetchContests();
    } catch (err) {
      alert(err.message || 'Failed to create contest');
    }
  };

  // Utility to format date for datetime-local input
  function toDatetimeLocal(date) {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  const handleEdit = (contest) => {
    setSelectedContest(contest);
    setEditForm({
      title: contest.title,
      description: contest.description,
      startTime: toDatetimeLocal(contest.startTime),
      endTime: toDatetimeLocal(contest.endTime),
      problems: contest.problems.map(p => p._id),
      isPublic: contest.isPublic,
      allowedUsers: contest.allowedUsers || []
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // Only send changed fields for timing
    const updatedFields = { ...editForm };
    if (selectedContest) {
      if (editForm.startTime === new Date(selectedContest.startTime).toISOString().slice(0, 16)) {
        delete updatedFields.startTime;
      }
      if (editForm.endTime === new Date(selectedContest.endTime).toISOString().slice(0, 16)) {
        delete updatedFields.endTime;
      }
    }
    try {
      await updateContest(selectedContest._id, updatedFields);
      setShowEditModal(false);
      fetchContests();
    } catch (err) {
      alert(err.message || 'Failed to update contest');
    }
  };

  const handleDelete = async (contestId) => {
    if (!window.confirm('Are you sure you want to delete this contest?')) return;
    setDeletingId(contestId);
    try {
      await deleteContest(contestId);
      fetchContests();
    } catch (err) {
      alert(err.message || 'Failed to delete contest');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (contest) => {
    setSelectedContest(contest);
    setShowViewModal(true);
  };

  const handleTogglePublic = async (contest) => {
    // Optimistically update the UI
    setContests(prev =>
      prev.map(c =>
        c._id === contest._id ? { ...c, isPublic: !c.isPublic } : c
      )
    );
    try {
      await updateContest(contest._id, { isPublic: !contest.isPublic });
      // Optionally, you can refetch contests here if you want to ensure data consistency
      // fetchContests();
    } catch (err) {
      // Revert the change if API fails
      setContests(prev =>
        prev.map(c =>
          c._id === contest._id ? { ...c, isPublic: contest.isPublic } : c
        )
      );
      alert(err.message || 'Failed to toggle contest visibility');
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (now < startTime) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', color: 'green', text: 'Active' };
    } else {
      return { status: 'ended', color: 'gray', text: 'Ended' };
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const CodeBackground = () => (
    <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-30">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="contestsCodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff99" />
            <stop offset="100%" stopColor="#00cfff" />
          </linearGradient>
        </defs>
        <text x="50%" y="20%" textAnchor="middle" fontSize="2.5rem" fill="url(#contestsCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"// Contest Management"}</text>
        <text x="50%" y="40%" textAnchor="middle" fontSize="2.5rem" fill="url(#contestsCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"function manageContests() { }"}</text>
      </svg>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-full bg-[#181c24]">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-transparent border-b-transparent border-l-[#00ff99] border-r-[#00cfff] shadow-lg" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}></div>
          <span className="mt-8 text-[#00ff99] font-mono text-lg tracking-widest animate-pulse drop-shadow-lg">Loading Contests...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ background: '#181c24', fontFamily: 'Fira Mono, monospace' }}>
        <CodeBackground />
        <div className="p-2 sm:p-4 md:p-6 relative z-10">
          {/* Header */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight mb-1">Contest Management</h1>
              <p className="text-[#baffea] font-mono text-xs sm:text-base">Manage coding contests and competitions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-2 sm:px-4 py-2 border-2 border-[#00ff99] text-xs sm:text-sm font-bold rounded-md text-[#00ff99] bg-[#181c24] hover:bg-[#232b3a] hover:border-[#00cfff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ff99] font-mono transition"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </button>
          </div>

          {/* Filters */}
          <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6 font-mono text-white hover:border-[#00ff99] transition-all grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="relative w-full md:w-1/3">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Search contests"
                className="w-full border-2 border-[#00cfff] rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>
            <select
              className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono shadow-inner placeholder-[#baffea] transition"
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

          {/* Contests Table */}
          <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg overflow-x-auto font-mono">
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-b-2 border-[#00cfff] bg-gradient-to-r from-[#181c24] to-[#232b3a]">
              <h3 className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">
                Contests ({contests.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#00cfff] text-xs sm:text-sm">
                <thead className="bg-[#181c24]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Start Time</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">End Time</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Problems</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">Visibility</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#232b3a] divide-y divide-[#00cfff]">
                  {contests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-[#baffea] font-mono">No contests found.</td>
                    </tr>
                  ) : (
                    contests.map((contest, idx) => {
                      const status = getContestStatus(contest);
                      const getStatusIcon = (status) => {
                        switch (status.status) {
                          case 'active':
                            return '🟢';
                          case 'upcoming':
                            return '🟡';
                          case 'ended':
                            return '⚪';
                          default:
                            return '';
                        }
                      };
                      return (
                        <tr key={contest._id} className={idx % 2 === 0 ? 'bg-[#232b3a] hover:bg-[#181c24]' : 'bg-[#181c24] hover:bg-[#232b3a]'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-mono text-base font-bold text-[#00ff99]">{contest.title}</div>
                            <div className="text-sm text-[#00cfff]">{contest.participants.length} participants</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${status.status === 'active' ? 'bg-green-900 text-green-300' : status.status === 'upcoming' ? 'bg-blue-900 text-blue-300' : 'bg-gray-800 text-gray-300'}`}>{getStatusIcon(status)} {status.text}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#baffea] font-mono">{formatDateTime(contest.startTime)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#baffea] font-mono">{formatDateTime(contest.endTime)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#00cfff] font-mono">{contest.problems.length}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              title={contest.isPublic ? 'Make Private' : 'Make Public'}
                              onClick={() => handleTogglePublic(contest)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${contest.isPublic ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'} transition-all`}
                            >
                              {contest.isPublic ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
                              {contest.isPublic ? 'Public' : 'Private'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                            <button onClick={() => handleEdit(contest)} className="px-2 py-1 rounded bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-bold shadow hover:from-[#00cfff] hover:to-[#00ff99] transition-all">Edit</button>
                            <button onClick={() => handleDelete(contest._id)} className="px-2 py-1 rounded bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow hover:from-red-500 hover:to-pink-500 transition-all" disabled={deletingId === contest._id}>{deletingId === contest._id ? <Clock size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>
                            <button onClick={() => handleView(contest)} className="px-2 py-1 rounded bg-gradient-to-r from-[#00cfff] to-[#00ff99] text-[#181c24] font-bold shadow hover:from-[#00ff99] hover:to-[#00cfff] transition-all"><Users size={16} /></button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Contest Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-[#181c24]/90 flex items-center justify-center z-50 overflow-y-auto">
              <div className="relative w-full max-w-2xl mx-4 mt-16 mb-10 p-8 rounded-2xl border-2 border-[#00ff99] bg-[#232b3a] shadow-2xl font-mono overflow-y-auto max-h-[90vh]" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text text-center mb-6 tracking-tight">Create New Contest</h3>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-base font-bold text-[#00ff99] mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={createForm.title}
                      onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold text-[#00cfff] mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={createForm.description}
                      onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-bold text-[#00ff99] mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={createForm.startTime}
                        onChange={e => setCreateForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-[#00cfff] mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={createForm.endTime}
                        onChange={e => setCreateForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-[#00ff99] mb-1">Problems</label>
                    <select
                      multiple
                      value={createForm.problems}
                      onChange={e => setCreateForm(prev => ({ 
                        ...prev, 
                        problems: Array.from(e.target.selectedOptions, option => option.value) 
                      }))}
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono shadow-inner"
                    >
                      {problems.map(problem => (
                        <option key={problem._id} value={problem._id}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-[#baffea] mt-1">Hold Ctrl/Cmd to select multiple problems</p>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="isPublicCreate"
                        type="checkbox"
                        checked={createForm.isPublic}
                        onChange={e => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                        className="h-4 w-4 text-[#00ff99] focus:ring-[#00cfff] border-[#00cfff] rounded"
                      />
                      <label htmlFor="isPublicCreate" className="ml-2 block text-base font-bold text-[#00ff99]">
                        Make contest public
                      </label>
                    </div>
                  </div>
                  {!createForm.isPublic && (
                    <div className="sm:col-span-2">
                      <label htmlFor="allowedUsers" className="block text-base font-bold text-[#00cfff]">Allowed Users (for private contest)</label>
                      <select multiple id="allowedUsers" value={createForm.allowedUsers} onChange={e => setCreateForm({...createForm, allowedUsers: Array.from(e.target.selectedOptions, option => option.value)})} className="mt-1 block w-full border-2 border-[#00cfff] rounded-md shadow-inner py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono h-32">
                        {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                      </select>
                      <p className="text-sm text-[#baffea] mt-1">Hold Ctrl/Cmd to select multiple users</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow hover:from-red-500 hover:to-pink-500 transition-all font-mono"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-bold shadow hover:from-[#00cfff] hover:to-[#00ff99] transition-all font-mono"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Contest Modal */}
          {showEditModal && selectedContest && (
            <div className="fixed inset-0 bg-[#181c24]/90 flex items-center justify-center z-50 overflow-y-auto">
              <div className="relative w-full max-w-2xl mx-4 mt-16 mb-10 p-8 rounded-2xl border-2 border-[#00ff99] bg-[#232b3a] shadow-2xl font-mono overflow-y-auto max-h-[90vh]" style={{ boxShadow: '0 0 32px #00cfff, 0 0 64px #00ff99' }}>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#00cfff] to-[#00ff99] text-transparent bg-clip-text text-center mb-6 tracking-tight">Edit Contest</h3>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-base font-bold text-[#00ff99] mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold text-[#00cfff] mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editForm.description}
                      onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-bold text-[#00ff99] mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={editForm.startTime}
                        onChange={e => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-[#00cfff] mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={editForm.endTime}
                        onChange={e => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white placeholder-[#baffea] font-mono shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-[#00ff99] mb-1">Problems</label>
                    <select
                      multiple
                      value={editForm.problems}
                      onChange={e => setEditForm(prev => ({ 
                        ...prev, 
                        problems: Array.from(e.target.selectedOptions, option => option.value) 
                      }))}
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono shadow-inner"
                    >
                      {problems.map(problem => (
                        <option key={problem._id} value={problem._id}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-[#baffea] mt-1">Hold Ctrl/Cmd to select multiple problems</p>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="isPublicEdit"
                        type="checkbox"
                        checked={editForm.isPublic}
                        onChange={e => setEditForm({ ...editForm, isPublic: e.target.checked })}
                        className="h-4 w-4 text-[#00ff99] focus:ring-[#00cfff] border-[#00cfff] rounded"
                      />
                      <label htmlFor="isPublicEdit" className="ml-2 block text-base font-bold text-[#00ff99]">
                        Make contest public
                      </label>
                    </div>
                  </div>
                  {!editForm.isPublic && (
                    <div className="sm:col-span-2">
                      <label htmlFor="edit-allowedUsers" className="block text-base font-bold text-[#00cfff]">Allowed Users (for private contest)</label>
                      <select multiple id="edit-allowedUsers" value={editForm.allowedUsers} onChange={e => setEditForm({...editForm, allowedUsers: Array.from(e.target.selectedOptions, option => option.value)})} className="mt-1 block w-full border-2 border-[#00cfff] rounded-md shadow-inner py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono h-32">
                        {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                      </select>
                      <p className="text-sm text-[#baffea] mt-1">Hold Ctrl/Cmd and click to select multiple users</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow hover:from-red-500 hover:to-pink-500 transition-all font-mono"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-bold shadow hover:from-[#00cfff] hover:to-[#00ff99] transition-all font-mono"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Contest Modal */}
          {showViewModal && selectedContest && (
            <div className="fixed inset-0 bg-[#181c24]/90 flex items-center justify-center z-50 overflow-y-auto">
              <div className="relative w-full max-w-2xl mx-4 mt-16 mb-10 p-8 rounded-2xl border-2 border-[#00cfff] bg-[#232b3a] shadow-2xl font-mono overflow-y-auto max-h-[90vh]" style={{ boxShadow: '0 0 32px #00cfff, 0 0 64px #00ff99' }}>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#00cfff] to-[#00ff99] text-transparent bg-clip-text text-center mb-6 tracking-tight">Contest Details</h3>
                <div className="space-y-4 text-left text-[#baffea]">
                  <div><span className="font-bold text-[#00ff99]">Title:</span> <span className="text-white">{selectedContest.title}</span></div>
                  <div><span className="font-bold text-[#00cfff]">Description:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2">{selectedContest.description}</pre></div>
                  <div><span className="font-bold text-[#00ff99]">Start Time:</span> <span className="text-white">{formatDateTime(selectedContest.startTime)}</span></div>
                  <div><span className="font-bold text-[#00cfff]">End Time:</span> <span className="text-white">{formatDateTime(selectedContest.endTime)}</span></div>
                  <div><span className="font-bold text-[#00ff99]">Status:</span> <span className="text-white">{getContestStatus(selectedContest).text}</span></div>
                  <div><span className="font-bold text-[#00cfff]">Problems:</span> <span className="text-white">{selectedContest.problems?.length || 0}</span></div>
                  {selectedContest.problems && selectedContest.problems.length > 0 && (
                    <ul className="mt-2 ml-4">
                      {selectedContest.problems.map(problem => (
                        <li key={problem._id} className="text-sm text-[#baffea]">
                          • <span className="text-[#00ff99] font-bold">{problem.title}</span> <span className="text-[#00cfff]">({problem.difficulty})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow hover:from-red-500 hover:to-pink-500 transition-all font-mono"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContests; 