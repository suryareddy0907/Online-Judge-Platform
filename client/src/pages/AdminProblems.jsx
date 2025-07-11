import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  getAllProblems, 
  createProblem, 
  updateProblem, 
  deleteProblem,
  toggleProblemPublish
} from '../services/adminService';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CodeBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-30">
    <svg width="100%" height="100%" className="absolute inset-0">
      <defs>
        <linearGradient id="problemsCodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff99" />
          <stop offset="100%" stopColor="#00cfff" />
        </linearGradient>
      </defs>
      <text x="50%" y="20%" textAnchor="middle" fontSize="2.5rem" fill="url(#problemsCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"// Problem Management"}</text>
      <text x="50%" y="40%" textAnchor="middle" fontSize="2.5rem" fill="url(#problemsCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"function manageProblems() { }"}</text>
    </svg>
  </div>
);

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    status: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActions, setShowActions] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    input: '',
    constraints: '',
    output: '',
    exampleTestCases: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '' }],
    difficulty: '',
    tags: ''
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    input: '',
    constraints: '',
    output: '',
    exampleTestCases: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '' }],
    difficulty: '',
    tags: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
  }, [filters.page]);

  // Handle browser back for view/edit modals
  useEffect(() => {
    if (showViewModal) {
      window.history.pushState({ modal: 'view' }, '');
      const handlePopState = (e) => {
        setShowViewModal(false);
        setSelectedProblem(null);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [showViewModal]);

  useEffect(() => {
    if (showEditModal) {
      window.history.pushState({ modal: 'edit' }, '');
      const handlePopState = (e) => {
        setShowEditModal(false);
        setSelectedProblem(null);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [showEditModal]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await getAllProblems(filters);
      setProblems(data.problems);
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
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleTogglePublish = async (problemId, isPublished) => {
    try {
      await toggleProblemPublish(problemId, isPublished);
      fetchProblems();
      setShowActions(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProblem(problemId);
      fetchProblems();
      setShowActions(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[difficulty]}`}>
        {difficulty}
      </span>
    );
  };

  const getStatusBadge = (isPublished) => {
    return isPublished ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Eye className="w-3 h-3 mr-1" />
        Published
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <EyeOff className="w-3 h-3 mr-1" />
        Draft
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-full bg-[#181c24]">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-transparent border-b-transparent border-l-[#00ff99] border-r-[#00cfff] shadow-lg" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}></div>
          <span className="mt-8 text-[#00ff99] font-mono text-lg tracking-widest animate-pulse drop-shadow-lg">Loading Problems...</span>
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
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight mb-1">Problem Management</h1>
              <p className="text-[#baffea] font-mono">Manage coding problems and challenges</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border-2 border-[#00ff99] text-sm font-bold rounded-md text-[#00ff99] bg-[#181c24] hover:bg-[#232b3a] hover:border-[#00cfff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ff99] font-mono transition"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Problem
            </button>
          </div>

          {/* Filters */}
          <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 mb-6 font-mono text-white hover:border-[#00ff99] transition-all">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input
                    type="text"
                    placeholder="Search problems"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        fetchProblems();
                      }
                    }}
                    className="pl-10 w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchProblems}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Apply Filters
                </button>
              </div>
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

          {/* Problems Table */}
          <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg overflow-hidden font-mono">
            <div className="px-6 py-4 border-b-2 border-[#00cfff] bg-gradient-to-r from-[#181c24] to-[#232b3a]">
              <h3 className="text-lg font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">
                Problems ({pagination.total})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#00cfff]">
                <thead className="bg-[#181c24]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Problem</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#232b3a] divide-y divide-[#00cfff]">
                  {problems.map((problem, idx) => (
                    <tr key={problem._id} className={idx % 2 === 0 ? 'bg-[#232b3a] hover:bg-[#181c24]' : 'bg-[#181c24] hover:bg-[#232b3a]'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-base font-extrabold text-[#00ff99]">{problem.title}</div>
                          <div className="text-sm text-[#00cfff]">{problem.tags?.join(', ') || 'No tags'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getDifficultyBadge(problem.difficulty)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(problem.isPublished)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#baffea]">{new Date(problem.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button onClick={() => { setSelectedProblem(problem); setShowViewModal(true); }} className="px-2 py-1 rounded bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-bold shadow hover:from-[#00cfff] hover:to-[#00ff99] transition-all">View</button>
                        <button onClick={() => { setEditForm({ title: problem.title, description: problem.statement, input: problem.input || '', constraints: problem.constraints || '', output: problem.output || '', exampleTestCases: problem.exampleTestCases || [{ input: '', output: '', explanation: '' }], testCases: problem.testCases || [{ input: '', output: '' }], difficulty: problem.difficulty || '', tags: (problem.tags || []).join(', ') }); setSelectedProblem(problem); setShowEditModal(true); }} className="px-2 py-1 rounded bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#181c24] font-bold shadow hover:from-yellow-600 hover:to-yellow-400 transition-all">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

          {/* Create Problem Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Create New Problem</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      // Prepare test cases for backend
                      const payload = {
                        title: createForm.title,
                        statement: createForm.description,
                        input: createForm.input,
                        constraints: createForm.constraints,
                        output: createForm.output,
                        exampleTestCases: createForm.exampleTestCases,
                        testCases: createForm.testCases, // hidden test cases
                        difficulty: createForm.difficulty,
                        tags: createForm.tags.split(',').map(t => t.trim()).filter(Boolean),
                      };
                      try {
                        await createProblem(payload);
                        setShowCreateModal(false);
                        fetchProblems();
                      } catch (err) {
                        alert(err.message || 'Failed to create problem');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Problem Title</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={createForm.title}
                        onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={createForm.description}
                        onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        value={createForm.input}
                        onChange={e => setCreateForm(f => ({ ...f, input: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Constraints</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        value={createForm.constraints}
                        onChange={e => setCreateForm(f => ({ ...f, constraints: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        value={createForm.output}
                        onChange={e => setCreateForm(f => ({ ...f, output: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Example Test Cases</label>
                      {createForm.exampleTestCases.map((tc, idx) => (
                        <div key={idx} className="flex flex-col space-y-1 mb-2 border p-2 rounded-md bg-gray-50">
                          <div className="flex space-x-2">
                            <textarea
                              placeholder="Input"
                              className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-y"
                              value={tc.input}
                              onChange={e => setCreateForm(f => {
                                const arr = [...f.exampleTestCases];
                                arr[idx].input = e.target.value;
                                return { ...f, exampleTestCases: arr };
                              })}
                              required
                              rows={2}
                            />
                            <textarea
                              placeholder="Output"
                              className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-y"
                              value={tc.output}
                              onChange={e => setCreateForm(f => {
                                const arr = [...f.exampleTestCases];
                                arr[idx].output = e.target.value;
                                return { ...f, exampleTestCases: arr };
                              })}
                              required
                              rows={2}
                            />
                            <button
                              type="button"
                              className="px-2 text-red-500"
                              onClick={() => setCreateForm(f => ({
                                ...f,
                                exampleTestCases: f.exampleTestCases.filter((_, i) => i !== idx)
                              }))}
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                          <textarea
                            placeholder="Explanation (optional)"
                            className="border border-gray-300 rounded-md px-2 py-1 mt-1"
                            value={tc.explanation}
                            onChange={e => setCreateForm(f => {
                              const arr = [...f.exampleTestCases];
                              arr[idx].explanation = e.target.value;
                              return { ...f, exampleTestCases: arr };
                            })}
                            rows={2}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-blue-600 text-sm mt-1"
                        onClick={() => setCreateForm(f => ({
                          ...f,
                          exampleTestCases: [...f.exampleTestCases, { input: '', output: '', explanation: '' }]
                        }))}
                      >
                        + Add Example Test Case
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hidden Test Cases</label>
                      {createForm.testCases.map((tc, idx) => (
                        <div key={idx} className="flex space-x-2 mb-2">
                          <textarea
                            placeholder="Input"
                            className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-y"
                            value={tc.input}
                            onChange={e => setCreateForm(f => {
                              const arr = [...f.testCases];
                              arr[idx].input = e.target.value;
                              return { ...f, testCases: arr };
                            })}
                            required
                            rows={2}
                          />
                          <textarea
                            placeholder="Output"
                            className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-y"
                            value={tc.output}
                            onChange={e => setCreateForm(f => {
                              const arr = [...f.testCases];
                              arr[idx].output = e.target.value;
                              return { ...f, testCases: arr };
                            })}
                            required
                            rows={2}
                          />
                          <button
                            type="button"
                            className="px-2 text-red-500"
                            onClick={() => setCreateForm(f => ({
                              ...f,
                              testCases: f.testCases.filter((_, i) => i !== idx)
                            }))}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-blue-600 text-sm mt-1"
                        onClick={() => setCreateForm(f => ({
                          ...f,
                          testCases: [...f.testCases, { input: '', output: '' }]
                        }))}
                      >
                        + Add Hidden Test Case
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                        <select
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={createForm.difficulty}
                          onChange={e => setCreateForm(f => ({ ...f, difficulty: e.target.value }))}
                          required
                        >
                          <option value="">Select</option>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={createForm.tags}
                          onChange={e => setCreateForm(f => ({ ...f, tags: e.target.value }))}
                          placeholder="e.g. arrays, dp, math"
                        />
                      </div>
                    </div>
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
          {/* View Problem Modal */}
          {showViewModal && selectedProblem && (
            <div className="modal-scrollbar fixed inset-0 bg-[#181c24]/90 z-50 overflow-y-auto min-h-screen">
              <div className="relative w-full max-w-2xl mx-auto mt-16 mb-10 p-8 rounded-2xl border-2 border-[#00ff99] bg-[#232b3a] shadow-2xl font-mono overflow-y-auto max-h-[90vh]" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text text-center mb-6">View Problem Details</h3>
                <div className="space-y-4 text-left text-[#baffea]">
                  <div><span className="font-bold text-[#00ff99]">Title:</span> <span className="text-white">{selectedProblem.title}</span></div>
                  <div><span className="font-bold text-[#00cfff]">Description:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2">{selectedProblem.statement}</pre></div>
                  <div><span className="font-bold text-[#00ff99]">Input:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2">{selectedProblem.input}</pre></div>
                  <div><span className="font-bold text-[#00cfff]">Constraints:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2">{selectedProblem.constraints}</pre></div>
                  <div><span className="font-bold text-[#00ff99]">Output:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2">{selectedProblem.output}</pre></div>
                  <div><span className="font-bold text-[#00cfff]">Difficulty:</span> <span className="text-white">{selectedProblem.difficulty}</span></div>
                  <div><span className="font-bold text-[#00ff99]">Tags:</span> <span className="text-white">{(selectedProblem.tags || []).join(', ')}</span></div>
                  <div><span className="font-bold text-[#00cfff]">Example Test Cases:</span>
                    {selectedProblem.exampleTestCases && selectedProblem.exampleTestCases.length > 0 ? (
                      <ul className="list-disc ml-6">
                        {selectedProblem.exampleTestCases.map((tc, idx) => (
                          <li key={idx} className="mb-2">
                            <div><span className="font-bold text-[#00ff99]">Input:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2 inline">{tc.input}</pre></div>
                            <div><span className="font-bold text-[#00cfff]">Output:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2 inline">{tc.output}</pre></div>
                            {tc.explanation && <div><span className="font-bold text-[#00ff99]">Explanation:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2 inline">{tc.explanation}</pre></div>}
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-gray-400">None</span>}
                  </div>
                  <div><span className="font-bold text-[#00ff99]">Hidden Test Cases:</span>
                    {selectedProblem.testCases && selectedProblem.testCases.length > 0 ? (
                      <ul className="list-disc ml-6">
                        {selectedProblem.testCases.map((tc, idx) => (
                          <li key={idx} className="mb-2">
                            <div><span className="font-bold text-[#00cfff]">Input:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2 inline">{tc.input}</pre></div>
                            <div><span className="font-bold text-[#00ff99]">Output:</span><br /><pre className="whitespace-pre-wrap font-mono text-white bg-[#181c24] rounded p-2 inline">{tc.output}</pre></div>
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-gray-400">None</span>}
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedProblem(null);
                      if (window.history.state && window.history.state.modal === 'view') {
                        window.history.back();
                      }
                    }}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-extrabold shadow hover:from-[#00cfff] hover:to-[#00ff99] transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Edit Problem Modal */}
          {showEditModal && selectedProblem && (
            <div className="modal-scrollbar fixed inset-0 bg-[#181c24]/90 z-50 overflow-y-auto min-h-screen">
              <div className="relative w-full max-w-2xl mx-auto mt-16 mb-10 p-8 rounded-2xl border-2 border-[#00ff99] bg-[#232b3a] shadow-2xl font-mono overflow-y-auto max-h-[90vh]" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text text-center mb-6">Edit Problem</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const payload = {
                      title: editForm.title,
                      statement: editForm.description,
                      input: editForm.input,
                      constraints: editForm.constraints,
                      output: editForm.output,
                      exampleTestCases: editForm.exampleTestCases,
                      testCases: editForm.testCases,
                      difficulty: editForm.difficulty,
                      tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
                    };
                    try {
                      await updateProblem(selectedProblem._id, payload);
                      setShowEditModal(false);
                      fetchProblems();
                    } catch (err) {
                      alert(err.message || 'Failed to update problem');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00ff99]">Problem Title</label>
                    <input
                      type="text"
                      className="w-full border-2 border-[#00cfff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono"
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00cfff]">Problem Description</label>
                    <textarea
                      className="w-full border-2 border-[#00cfff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono"
                      rows={3}
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00ff99]">Input</label>
                    <textarea
                      className="w-full border-2 border-[#00cfff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono"
                      rows={2}
                      value={editForm.input}
                      onChange={e => setEditForm(f => ({ ...f, input: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00cfff]">Constraints</label>
                    <textarea
                      className="w-full border-2 border-[#00cfff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono"
                      rows={2}
                      value={editForm.constraints}
                      onChange={e => setEditForm(f => ({ ...f, constraints: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00ff99]">Output</label>
                    <textarea
                      className="w-full border-2 border-[#00cfff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono"
                      rows={2}
                      value={editForm.output}
                      onChange={e => setEditForm(f => ({ ...f, output: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00cfff]">Example Test Cases</label>
                    {editForm.exampleTestCases.map((tc, idx) => (
                      <div key={idx} className="flex flex-col space-y-1 mb-2 border-2 border-[#00cfff] p-2 rounded-md bg-[#181c24]">
                        <div className="flex space-x-2">
                          <textarea
                            placeholder="Input"
                            className="flex-1 border-2 border-[#00ff99] rounded-md px-2 py-1 resize-y bg-[#232b3a] text-white font-mono"
                            value={tc.input}
                            onChange={e => setEditForm(f => {
                              const arr = [...f.exampleTestCases];
                              arr[idx].input = e.target.value;
                              return { ...f, exampleTestCases: arr };
                            })}
                            required
                            rows={2}
                          />
                          <textarea
                            placeholder="Output"
                            className="flex-1 border-2 border-[#00ff99] rounded-md px-2 py-1 resize-y bg-[#232b3a] text-white font-mono"
                            value={tc.output}
                            onChange={e => setEditForm(f => {
                              const arr = [...f.exampleTestCases];
                              arr[idx].output = e.target.value;
                              return { ...f, exampleTestCases: arr };
                            })}
                            required
                            rows={2}
                          />
                          <button
                            type="button"
                            className="px-2 text-red-400 font-extrabold hover:text-pink-400"
                            onClick={() => setEditForm(f => ({
                              ...f,
                              exampleTestCases: f.exampleTestCases.filter((_, i) => i !== idx)
                            }))}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                        <textarea
                          placeholder="Explanation (optional)"
                          className="border-2 border-[#00cfff] rounded-md px-2 py-1 mt-1 bg-[#232b3a] text-white font-mono"
                          value={tc.explanation}
                          onChange={e => setEditForm(f => {
                            const arr = [...f.exampleTestCases];
                            arr[idx].explanation = e.target.value;
                            return { ...f, exampleTestCases: arr };
                          })}
                          rows={2}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-[#00cfff] text-sm mt-1 font-bold hover:text-[#00ff99]"
                      onClick={() => setEditForm(f => ({
                        ...f,
                        exampleTestCases: [...f.exampleTestCases, { input: '', output: '', explanation: '' }]
                      }))}
                    >
                      + Add Example Test Case
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00ff99]">Hidden Test Cases</label>
                    {editForm.testCases.map((tc, idx) => (
                      <div key={idx} className="flex space-x-2 mb-2">
                        <textarea
                          placeholder="Input"
                          className="flex-1 border-2 border-[#00cfff] rounded-md px-2 py-1 resize-y bg-[#232b3a] text-white font-mono"
                          value={tc.input}
                          onChange={e => setEditForm(f => {
                            const arr = [...f.testCases];
                            arr[idx].input = e.target.value;
                            return { ...f, testCases: arr };
                          })}
                          required
                          rows={2}
                        />
                        <textarea
                          placeholder="Output"
                          className="flex-1 border-2 border-[#00cfff] rounded-md px-2 py-1 resize-y bg-[#232b3a] text-white font-mono"
                          value={tc.output}
                          onChange={e => setEditForm(f => {
                            const arr = [...f.testCases];
                            arr[idx].output = e.target.value;
                            return { ...f, testCases: arr };
                          })}
                          required
                          rows={2}
                        />
                        <button
                          type="button"
                          className="px-2 text-red-400 font-extrabold hover:text-pink-400"
                          onClick={() => setEditForm(f => ({
                            ...f,
                            testCases: f.testCases.filter((_, i) => i !== idx)
                          }))}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-[#00cfff] text-sm mt-1 font-bold hover:text-[#00ff99]"
                      onClick={() => setEditForm(f => ({
                        ...f,
                        testCases: [...f.testCases, { input: '', output: '' }]
                      }))}
                    >
                      + Add Hidden Test Case
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00ff99]">Difficulty</label>
                      <select
                        className="w-full border-2 border-[#00cfff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono"
                        value={editForm.difficulty}
                        onChange={e => setEditForm(f => ({ ...f, difficulty: e.target.value }))}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-[#00cfff]">Tags (comma separated)</label>
                      <input
                        type="text"
                        className="w-full border-2 border-[#00cfff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#181c24] text-white font-mono"
                        value={editForm.tags}
                        onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                        placeholder="e.g. arrays, dp, math"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedProblem(null);
                        if (window.history.state && window.history.state.modal === 'edit') {
                          window.history.back();
                        }
                      }}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white font-extrabold shadow hover:from-red-500 hover:to-pink-500 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-extrabold shadow hover:from-[#00cfff] hover:to-[#00ff99] transition-all"
                    >
                      Save Changes
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

export default AdminProblems; 