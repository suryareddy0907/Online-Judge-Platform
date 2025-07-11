import React, { useEffect, useState, useRef } from 'react';
import { getMySubmissions } from '../services/authService';
import { Logo } from '../components/AdminNavbar';

// Animated Gradient Aurora Background
const AuroraBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
    <svg width="100%" height="100%" className="absolute inset-0 w-full h-full" style={{ minHeight: '100vh' }}>
      <defs>
        <radialGradient id="aurora1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#00ff99" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#232b3a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aurora2" cx="70%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#00cfff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#232b3a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aurora3" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#ff00cc" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#232b3a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="30%" cy="30%" rx="60%" ry="30%" fill="url(#aurora1)">
        <animate attributeName="cx" values="30%;40%;30%" dur="8s" repeatCount="indefinite" />
        <animate attributeName="cy" values="30%;40%;30%" dur="10s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="70%" cy="60%" rx="50%" ry="25%" fill="url(#aurora2)">
        <animate attributeName="cx" values="70%;60%;70%" dur="12s" repeatCount="indefinite" />
        <animate attributeName="cy" values="60%;70%;60%" dur="14s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="50%" cy="80%" rx="40%" ry="20%" fill="url(#aurora3)">
        <animate attributeName="cx" values="50%;55%;50%" dur="10s" repeatCount="indefinite" />
        <animate attributeName="cy" values="80%;75%;80%" dur="13s" repeatCount="indefinite" />
      </ellipse>
    </svg>
  </div>
);

// Matrix Code Rain Overlay
const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let fontSize = 18;
    let columns = Math.floor(width / fontSize);
    let drops = Array(columns).fill(1);
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1);
    }
    window.addEventListener('resize', resize);
    resize();
    function draw() {
      ctx.fillStyle = 'rgba(24,28,36,0.18)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px Fira Mono, monospace`;
      for (let i = 0; i < columns; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.shadowColor = '#00ff99';
        ctx.shadowBlur = 8;
        ctx.fillStyle = Math.random() > 0.95 ? '#00cfff' : '#00ff99';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        ctx.shadowBlur = 0;
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none"
      style={{ opacity: 0.55, mixBlendMode: 'lighter' }}
    />
  );
};

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
    <div className="min-h-screen bg-[#181c24] text-white font-mono px-4 py-10 relative overflow-hidden" style={{ fontFamily: 'Fira Mono, monospace' }}>
      <AuroraBackground />
      <MatrixRain />
      <div className="max-w-5xl mx-auto">
        <Logo />
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-8 tracking-tight">My Submissions</h1>
        <div className="mb-8 flex flex-wrap gap-4 items-end">
          <div className="relative w-full md:w-1/3">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Problem title"
              className="w-full border-2 border-[#00cfff] rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner"
              value={filters.problem}
              onChange={e => handleFilterChange('problem', e.target.value)}
            />
          </div>
          <select
            className="border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono"
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
            className="border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono"
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
        {error && <div className="bg-red-900/80 border border-red-400 text-red-200 px-4 py-3 rounded mb-6 font-mono">{error}</div>}
        {loading ? (
          <div className="text-center py-10 text-[#baffea] font-mono animate-pulse">Loading submissions...</div>
        ) : (
          <div className="overflow-x-auto bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg font-mono">
            <table className="min-w-full divide-y divide-[#00cfff]">
              <thead className="bg-[#181c24]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00ff99] uppercase tracking-wider">Verdict</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-[#00cfff] uppercase tracking-wider">Submitted At</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-[#232b3a] divide-y divide-[#00cfff]">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-[#baffea] font-mono">No submissions found.</td>
                  </tr>
                ) : (
                  submissions.map(sub => (
                    <tr key={sub._id} className="hover:bg-[#181c24] cursor-pointer transition-all" onClick={() => handleView(sub)}>
                      <td className="px-6 py-4">
                        {sub.problem ? highlightMatch(sub.problem.title || '-', filters.problem) : '-'}
                      </td>
                      <td className="px-6 py-4">{sub.language}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${sub.verdict === 'AC' ? 'bg-green-900 text-green-300' : sub.verdict === 'WA' ? 'bg-red-900 text-red-300' : sub.verdict === 'TLE' ? 'bg-yellow-900 text-yellow-300' : sub.verdict === 'RE' ? 'bg-blue-900 text-blue-300' : sub.verdict === 'CE' ? 'bg-pink-900 text-pink-300' : 'bg-gray-700 text-gray-300'}`}>{sub.verdict}</span>
                      </td>
                      <td className="px-6 py-4">{new Date(sub.submittedAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <button
                          className="text-[#00cfff] hover:underline text-sm font-bold"
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
          <div className="fixed inset-0 bg-[#181c24]/90 flex items-center justify-center z-50">
            <div className="relative w-full max-w-2xl mx-4 mt-16 mb-10 p-8 rounded-2xl border-2 border-[#00ff99] bg-[#232b3a] shadow-2xl font-mono overflow-y-auto max-h-[90vh]" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}>
              {/* Custom Back Button */}
              <button
                className="absolute top-2 left-2 text-[#00cfff] hover:text-[#00ff99] text-2xl font-bold"
                onClick={handleCloseModal}
                aria-label="Back"
              >
                &#8592;
              </button>
              <button
                className="absolute top-2 right-2 text-[#00cfff] hover:text-[#00ff99] text-2xl font-bold"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-6 text-center tracking-tight">Submission Details</h2>
              <div className="mb-6">
                <span className="block text-[#baffea] text-lg font-bold mb-2">Problem:</span> <span className="text-[#00cfff] font-mono">{selectedSubmission.problem?.title || '-'}</span><br />
                <span className="block text-[#baffea] text-lg font-bold mb-2">Language:</span> <span className="text-[#00cfff] font-mono">{selectedSubmission.language}</span><br />
                <span className="block text-[#baffea] text-lg font-bold mb-2">Submitted At:</span> <span className="text-[#00cfff] font-mono">{new Date(selectedSubmission.submittedAt).toLocaleString()}</span><br />
              </div>
              <div className="mb-6">
                <span className="block text-[#baffea] text-lg font-bold mb-2">Code:</span>
                <pre className="bg-[#181c24] border-2 border-[#00cfff] p-4 rounded-lg mt-2 overflow-x-auto text-base text-[#baffea] font-mono modal-scrollbar" style={{ maxHeight: 300 }}>{selectedSubmission.code}</pre>
              </div>
              <div className="mb-4">
                <span className="block text-[#baffea] text-lg font-bold mb-2">Verdict:</span> <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${selectedSubmission.verdict === 'AC' ? 'bg-green-900 text-green-300' : selectedSubmission.verdict === 'WA' ? 'bg-red-900 text-red-300' : selectedSubmission.verdict === 'TLE' ? 'bg-yellow-900 text-yellow-300' : selectedSubmission.verdict === 'RE' ? 'bg-blue-900 text-blue-300' : selectedSubmission.verdict === 'CE' ? 'bg-pink-900 text-pink-300' : 'bg-gray-700 text-gray-300'}`}>{selectedSubmission.verdict}</span>
              </div>
              {selectedSubmission.errorMessage && (
                <div className="bg-red-900/80 border border-red-400 rounded-md p-2 mt-2 text-red-200 text-sm font-mono">
                  <span className="font-bold">Error:</span> {selectedSubmission.errorMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubmissions; 