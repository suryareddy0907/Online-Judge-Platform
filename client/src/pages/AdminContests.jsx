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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contest Management</h1>
            <p className="text-gray-600">Manage coding contests and competitions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Contest
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <input
            type="text"
            placeholder="Search contests..."
            className="border px-3 py-2 rounded"
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded"
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
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Problems</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">No contests found.</td>
                </tr>
              ) : (
                contests.map(contest => {
                  const status = getContestStatus(contest);
                  return (
                    <tr key={contest._id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{contest.title}</div>
                        <div className="text-sm text-gray-500">{contest.participants.length} participants</div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${status.color}-100 text-${status.color}-800`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatDateTime(contest.startTime)}</td>
                      <td className="px-4 py-2">{formatDateTime(contest.endTime)}</td>
                      <td className="px-4 py-2">{contest.problems.length}</td>
                      <td className="px-4 py-2">
                        <button
                          title={contest.isPublic ? 'Make Private' : 'Make Public'}
                          onClick={() => handleTogglePublic(contest)}
                          className={`p-1 rounded-full ${contest.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {contest.isPublic ? <Eye size={16}/> : <EyeOff size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-2 flex items-center space-x-2">
                        <button onClick={() => handleEdit(contest)} className="text-blue-600 hover:text-blue-900"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(contest._id)} className="text-red-600 hover:text-red-900" disabled={deletingId === contest._id}>
                          {deletingId === contest._id ? <Clock size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                        <button onClick={() => handleView(contest)} className="text-gray-600 hover:text-gray-900"><Users size={16} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Create Contest Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Create New Contest</h3>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={createForm.title}
                      onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={createForm.description}
                      onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={createForm.startTime}
                        onChange={e => setCreateForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={createForm.endTime}
                        onChange={e => setCreateForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problems</label>
                    <select
                      multiple
                      value={createForm.problems}
                      onChange={e => setCreateForm(prev => ({ 
                        ...prev, 
                        problems: Array.from(e.target.selectedOptions, option => option.value) 
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {problems.map(problem => (
                        <option key={problem._id} value={problem._id}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple problems</p>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="isPublicCreate"
                        type="checkbox"
                        checked={createForm.isPublic}
                        onChange={e => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPublicCreate" className="ml-2 block text-sm text-gray-900">
                        Make contest public
                      </label>
                    </div>
                  </div>
                  {!createForm.isPublic && (
                    <div className="sm:col-span-2">
                      <label htmlFor="allowedUsers" className="block text-sm font-medium text-gray-700">Allowed Users (for private contest)</label>
                      <select multiple id="allowedUsers" value={createForm.allowedUsers} onChange={e => setCreateForm({...createForm, allowedUsers: Array.from(e.target.selectedOptions, option => option.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32">
                        {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Contest Modal */}
        {showEditModal && selectedContest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Edit Contest</h3>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editForm.description}
                      onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={editForm.startTime}
                        onChange={e => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={editForm.endTime}
                        onChange={e => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problems</label>
                    <select
                      multiple
                      value={editForm.problems}
                      onChange={e => setEditForm(prev => ({ 
                        ...prev, 
                        problems: Array.from(e.target.selectedOptions, option => option.value) 
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {problems.map(problem => (
                        <option key={problem._id} value={problem._id}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple problems</p>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="isPublicEdit"
                        type="checkbox"
                        checked={editForm.isPublic}
                        onChange={e => setEditForm({ ...editForm, isPublic: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPublicEdit" className="ml-2 block text-sm text-gray-900">
                        Make contest public
                      </label>
                    </div>
                  </div>
                  {!editForm.isPublic && (
                    <div className="sm:col-span-2">
                      <label htmlFor="edit-allowedUsers" className="block text-sm font-medium text-gray-700">Allowed Users (for private contest)</label>
                      <select multiple id="edit-allowedUsers" value={editForm.allowedUsers} onChange={e => setEditForm({...editForm, allowedUsers: Array.from(e.target.selectedOptions, option => option.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32">
                        {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                      </select>
                      <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd and click to select multiple users</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Contest Modal */}
        {showViewModal && selectedContest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Contest Details</h3>
                <div className="space-y-4">
                  <div>
                    <strong>Title:</strong> {selectedContest.title}
                  </div>
                  <div>
                    <strong>Description:</strong> {selectedContest.description}
                  </div>
                  <div>
                    <strong>Start Time:</strong> {formatDateTime(selectedContest.startTime)}
                  </div>
                  <div>
                    <strong>End Time:</strong> {formatDateTime(selectedContest.endTime)}
                  </div>
                  <div>
                    <strong>Status:</strong> {getContestStatus(selectedContest).text}
                  </div>
                  <div>
                    <strong>Problems:</strong> {selectedContest.problems?.length || 0}
                    {selectedContest.problems && selectedContest.problems.length > 0 && (
                      <ul className="mt-2 ml-4">
                        {selectedContest.problems.map(problem => (
                          <li key={problem._id} className="text-sm">
                            • {problem.title} ({problem.difficulty})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContests; 