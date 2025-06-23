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

  useEffect(() => {
    fetchProblems();
  }, [filters.page]);

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
            <h1 className="text-2xl font-bold text-gray-900">Problem Management</h1>
            <p className="text-gray-600">Manage coding problems and challenges</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Problem
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchProblems();
                    }
                  }}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Problems ({pagination.total})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {problems.map((problem) => (
                  <tr key={problem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {problem.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {problem.tags?.join(', ') || 'No tags'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDifficultyBadge(problem.difficulty)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(problem.isPublished)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(problem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTogglePublish(problem._id, !problem.isPublished)}
                          className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded ${
                            problem.isPublished
                              ? 'text-red-700 bg-red-100 hover:bg-red-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {problem.isPublished ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Publish
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteProblem(problem._id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProblem(problem);
                            setShowViewModal(true);
                          }}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setEditForm({
                              title: problem.title,
                              description: problem.statement,
                              input: problem.input || '',
                              constraints: problem.constraints || '',
                              output: problem.output || '',
                              exampleTestCases: problem.exampleTestCases || [{ input: '', output: '', explanation: '' }],
                              testCases: problem.testCases || [{ input: '', output: '' }],
                              difficulty: problem.difficulty || '',
                              tags: (problem.tags || []).join(', ')
                            });
                            setSelectedProblem(problem);
                            setShowEditModal(true);
                          }}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                        >
                          Edit
                        </button>
                      </div>
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">View Problem Details</h3>
                <div className="space-y-2 text-left">
                  <div><strong>Title:</strong> {selectedProblem.title}</div>
                  <div><strong>Description:</strong> <pre className="whitespace-pre-wrap">{selectedProblem.statement}</pre></div>
                  <div><strong>Input:</strong> <pre className="whitespace-pre-wrap">{selectedProblem.input}</pre></div>
                  <div><strong>Constraints:</strong> <pre className="whitespace-pre-wrap">{selectedProblem.constraints}</pre></div>
                  <div><strong>Output:</strong> <pre className="whitespace-pre-wrap">{selectedProblem.output}</pre></div>
                  <div><strong>Difficulty:</strong> {selectedProblem.difficulty}</div>
                  <div><strong>Tags:</strong> {(selectedProblem.tags || []).join(', ')}</div>
                  <div><strong>Example Test Cases:</strong>
                    {selectedProblem.exampleTestCases && selectedProblem.exampleTestCases.length > 0 ? (
                      <ul className="list-disc ml-6">
                        {selectedProblem.exampleTestCases.map((tc, idx) => (
                          <li key={idx}>
                            <div><strong>Input:</strong> {tc.input}</div>
                            <div><strong>Output:</strong> {tc.output}</div>
                            {tc.explanation && <div><strong>Explanation:</strong> {tc.explanation}</div>}
                          </li>
                        ))}
                      </ul>
                    ) : <span>None</span>}
                  </div>
                  <div><strong>Hidden Test Cases:</strong>
                    {selectedProblem.testCases && selectedProblem.testCases.length > 0 ? (
                      <ul className="list-disc ml-6">
                        {selectedProblem.testCases.map((tc, idx) => (
                          <li key={idx}>
                            <div><strong>Input:</strong> {tc.input}</div>
                            <div><strong>Output:</strong> {tc.output}</div>
                          </li>
                        ))}
                      </ul>
                    ) : <span>None</span>}
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
        {/* Edit Problem Modal */}
        {showEditModal && selectedProblem && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Edit Problem</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Title</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      value={editForm.input}
                      onChange={e => setEditForm(f => ({ ...f, input: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Constraints</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      value={editForm.constraints}
                      onChange={e => setEditForm(f => ({ ...f, constraints: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      value={editForm.output}
                      onChange={e => setEditForm(f => ({ ...f, output: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Example Test Cases</label>
                    {editForm.exampleTestCases.map((tc, idx) => (
                      <div key={idx} className="flex flex-col space-y-1 mb-2 border p-2 rounded-md bg-gray-50">
                        <div className="flex space-x-2">
                          <textarea
                            placeholder="Input"
                            className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-y"
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
                            className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-y"
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
                            className="px-2 text-red-500"
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
                          className="border border-gray-300 rounded-md px-2 py-1 mt-1"
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
                      className="text-blue-600 text-sm mt-1"
                      onClick={() => setEditForm(f => ({
                        ...f,
                        exampleTestCases: [...f.exampleTestCases, { input: '', output: '', explanation: '' }]
                      }))}
                    >
                      + Add Example Test Case
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hidden Test Cases</label>
                    {editForm.testCases.map((tc, idx) => (
                      <div key={idx} className="flex space-x-2 mb-2">
                        <textarea
                          placeholder="Input"
                          className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-y"
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
                          className="flex-1 border border-gray-300 rounded-md px-2 py-1 resize-y"
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
                          className="px-2 text-red-500"
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
                      className="text-blue-600 text-sm mt-1"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editForm.tags}
                        onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                        placeholder="e.g. arrays, dp, math"
                      />
                    </div>
                  </div>
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
      </div>
    </AdminLayout>
  );
};

export default AdminProblems; 