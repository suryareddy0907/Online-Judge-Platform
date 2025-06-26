import React, { useEffect, useState } from 'react';
import { getMySubmissions } from '../services/authService';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ problem: '', language: '', verdict: '' });
  const [viewModal, setViewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, [filters]);

  useEffect(() => {
    if (viewModal) {
      window.history.pushState({ modal: true }, '');
      const handlePopState = (e) => {
        setViewModal(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [viewModal]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMySubmissions(filters);
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Utility to highlight matches
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'ig');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} style={{ background: '#fff59d', padding: 0 }}>{part}</mark> : part
    );
  }

  const handleView = (submission) => {
    setSelectedSubmission(submission);
    setViewModal(true);
  };

  const handleCloseModal = () => {
    setViewModal(false);
    if (window.history.state && window.history.state.modal) {
      window.history.back();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">My Submissions</h1>
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <input
          type="text"
          placeholder="Problem title"
          className="border px-3 py-2 rounded"
          value={filters.problem}
          onChange={e => handleFilterChange('problem', e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded"
          value={filters.language}
          onChange={e => handleFilterChange('language', e.target.value)}
        >
          <option value="">All Languages</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
        </select>
        <select
          className="border px-3 py-2 rounded"
          value={filters.verdict}
          onChange={e => handleFilterChange('verdict', e.target.value)}
        >
          <option value="">All Verdicts</option>
          <option value="AC">Accepted</option>
          <option value="WA">Wrong Answer</option>
          <option value="TLE">Time Limit Exceeded</option>
          <option value="RE">Runtime Error</option>
          <option value="CE">Compilation Error</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading submissions...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Problem</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verdict</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">No submissions found.</td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub._id} className="hover:bg-blue-50 cursor-pointer" onClick={() => handleView(sub)}>
                    <td className="px-4 py-2">
                      {sub.problem ? highlightMatch(sub.problem.title || '-', filters.problem) : '-'}
                    </td>
                    <td className="px-4 py-2">{sub.language}</td>
                    <td className="px-4 py-2">{sub.verdict}</td>
                    <td className="px-4 py-2">{new Date(sub.submittedAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={e => { e.stopPropagation(); handleView(sub); }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* View Modal */}
      {viewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 relative">
            {/* Custom Back Button */}
            <button
              className="absolute top-2 left-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              onClick={handleCloseModal}
              aria-label="Back"
            >
              &#8592;
            </button>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-2">Submission Details</h2>
            <div className="mb-4">
              <strong>Problem:</strong> {selectedSubmission.problem?.title || '-'}<br />
              <strong>Language:</strong> {selectedSubmission.language}<br />
              <strong>Submitted At:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}<br />
            </div>
            <div className="mb-4">
              <strong>Code:</strong>
              <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-sm" style={{ maxHeight: 300 }}>{selectedSubmission.code}</pre>
            </div>
            <div className="mb-2">
              <strong>Verdict:</strong> <span className="font-semibold">{selectedSubmission.verdict}</span>
            </div>
            {selectedSubmission.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2 text-red-700 text-sm">
                <strong>Error:</strong> {selectedSubmission.errorMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubmissions; 