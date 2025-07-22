import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllSubmissions, deleteSubmission, getSubmissionDetails } from '../services/adminService';
import { useNavigate } from 'react-router-dom';

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ user: '', problem: '', language: '', verdict: '' });
  const [viewModal, setViewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const modalOpenedRef = useRef(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, [filters, page]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (modalOpenedRef.current) {
        setViewModal(false);
        setSelectedSubmission(null);
        modalOpenedRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Push state only once when modal opens
    if (viewModal && !modalOpenedRef.current) {
      window.history.pushState({ modal: true }, '');
      modalOpenedRef.current = true;
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [viewModal]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSubmissions({ ...filters, page, limit: 10 });
      setSubmissions(data.submissions);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    setDeletingId(submissionId);
    try {
      await deleteSubmission(submissionId);
      fetchSubmissions();
    } catch (err) {
      alert(err.message || 'Failed to delete submission');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (submissionId) => {
    setViewModal(true);
    setSelectedSubmission(null);
    try {
      const data = await getSubmissionDetails(submissionId);
      setSelectedSubmission(data.submission);
    } catch (err) {
      setSelectedSubmission({ error: err.message });
    }
  };

  const handleCloseModal = () => {
    if (modalOpenedRef.current) {
      window.history.back(); // triggers popstate
    } else {
      setViewModal(false); // fallback
    }
  };

  // Utility to highlight matches
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} style={{ background: '#fff59d', padding: 0 }}>{part}</mark> : part
    );
  }

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case "AC":
        return "✅";
      case "WA":
        return "🟥";
      case "TLE":
        return "🟨";
      case "RE":
        return "🟦";
      case "CE":
        return "❌";
      case "Pending":
        return "⏳";
      default:
        return "❓";
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ background: '#181c24', fontFamily: 'Fira Mono, monospace' }}>
        <div className="p-2 sm:p-4 md:p-6 relative z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight mb-4">Submission Management</h1>
          <div className="mb-4 flex flex-col sm:flex-row sm:gap-4 gap-2 items-stretch">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  placeholder="User (username or email)"
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 bg-transparent placeholder-[#baffea]"
                  value={filters.user}
                  onChange={e => handleFilterChange('user', e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  placeholder="Problem title"
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 bg-transparent placeholder-[#baffea]"
                  value={filters.problem}
                  onChange={e => handleFilterChange('problem', e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1">
              <select
                className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono shadow-inner placeholder-[#baffea] transition"
                value={filters.language}
                onChange={e => handleFilterChange('language', e.target.value)}
              >
                <option value="">All Languages</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div className="flex-1">
              <select
                className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono shadow-inner placeholder-[#baffea] transition"
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
          </div>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center bg-[#181c24]">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-transparent border-b-transparent border-l-[#00ff99] border-r-[#00cfff] shadow-lg"></div>
              <span className="mt-8 text-[#00ff99] font-mono text-lg tracking-widest animate-pulse drop-shadow-lg">Loading Submissions...</span>
            </div>
          ) : (
            <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg overflow-x-auto font-mono">
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-b-2 border-[#00ff99] bg-gradient-to-r from-[#181c24] to-[#232b3a]">
                <h3 className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">
                  Submissions
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#00ff99] text-xs sm:text-sm">
                  <thead className="bg-[#181c24]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider font-mono"> </th>
                      <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider font-mono">Submission</th>
                      <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider font-mono">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#232b3a] divide-y divide-[#00cfff]">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-6 text-[#baffea] font-mono">No submissions found.</td>
                      </tr>
                    ) : (
                      submissions.map((sub, idx) => (
                        <tr
                          key={sub._id}
                          className={idx % 2 === 0 ? 'bg-[#232b3a] hover:bg-[#181c24] cursor-pointer' : 'bg-[#181c24] hover:bg-[#232b3a] cursor-pointer'}
                          onClick={() => handleView(sub._id)}
                        >
                          <td className="px-6 py-4 align-top text-xl font-mono">{getVerdictIcon(sub.verdict)}</td>
                          <td className="px-6 py-4 align-top whitespace-nowrap">
                            <div className="font-mono text-base font-bold text-[#00ff99]">
                              {sub.user ? (sub.user.username || sub.user.email || '-') : '-'}
                              {" / "}
                              {sub.problem ? (sub.problem.title || '-') : '-'}
                            </div>
                            <div className="font-mono text-sm text-[#00cfff] mt-1">
                              {sub.language} &bull; {sub.verdict} &bull; {new Date(sub.submittedAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <button
                              className="px-2 py-1 rounded bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow hover:from-red-500 hover:to-pink-500 transition-all font-mono"
                              onClick={e => { e.stopPropagation(); handleDelete(sub._id); }}
                              disabled={deletingId === sub._id}
                            >
                              {deletingId === sub._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  className="px-4 py-2 rounded bg-[#00cfff] text-[#181c24] font-bold mr-2 disabled:opacity-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-[#baffea] font-mono">Page {page} of {totalPages}</span>
                <button
                  className="px-4 py-2 rounded bg-[#00ff99] text-[#181c24] font-bold ml-2 disabled:opacity-50"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {/* View Modal */}
          {viewModal && (
            <div className="fixed inset-0 bg-[#181c24]/90 flex items-center justify-center z-50">
              <div className="relative w-full max-w-2xl mx-4 mt-16 mb-10 p-8 rounded-2xl border-2 border-[#00ff99] bg-[#232b3a] shadow-2xl font-mono overflow-y-auto max-h-[90vh]">
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
                {!selectedSubmission ? (
                  <div className="min-h-[200px] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-b-transparent border-l-[#00ff99] border-r-[#00cfff] shadow-lg"></div>
                    <span className="mt-6 text-[#00ff99] font-mono text-base tracking-widest animate-pulse drop-shadow-lg">Loading Submission...</span>
                  </div>
                ) : selectedSubmission.error ? (
                  <div className="text-center text-red-500">{selectedSubmission.error}</div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-white">Submission Details</h2>
                    <div className="mb-4">
                      <strong>User:</strong> {selectedSubmission.user?.username || selectedSubmission.user?.email || '-'}<br />
                      <strong>Problem:</strong> {selectedSubmission.problem?.title || '-'}<br />
                      <strong>Language:</strong> {selectedSubmission.language}<br />
                      <strong>Submitted At:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}<br />
                    </div>
                    <div className="mb-4">
                      <strong>Code:</strong>
                      <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-sm" style={{ maxHeight: 300 }}>{selectedSubmission.code}</pre>
                    </div>
                    <div className="mb-2">
                      <strong>Verdict:</strong> <span className="font-semibold text-white">{selectedSubmission.verdict}</span>
                    </div>
                    {selectedSubmission.errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2 text-red-700 text-sm">
                        <strong>Error:</strong> {selectedSubmission.errorMessage}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissions; 