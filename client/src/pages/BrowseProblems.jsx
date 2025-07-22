import React, { useEffect, useState, useRef } from "react";
import { getPublicProblems, getUserSolvedCount, getMySubmissions } from "../services/authService";
import { useNavigate } from "react-router-dom";
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

// Animated code background SVG (copied from Home)
const CodeBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-30">
    <svg width="100%" height="100%" className="absolute inset-0">
      <defs>
        <linearGradient id="browseCodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff99" />
          <stop offset="100%" stopColor="#00cfff" />
        </linearGradient>
      </defs>
      <text x="50%" y="20%" textAnchor="middle" fontSize="2.5rem" fill="url(#browseCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"// Browse Problems"}</text>
      <text x="50%" y="40%" textAnchor="middle" fontSize="2.5rem" fill="url(#browseCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"function browseProblems() { }"}</text>
    </svg>
  </div>
);

const BrowseProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [solvedCounts, setSolvedCounts] = useState({});
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchSolvedCounts = async (problems) => {
    const counts = {};
    for (const problem of problems) {
      if (problem.createdBy && problem.createdBy._id) {
        try {
          const data = await getUserSolvedCount(problem.createdBy._id);
          counts[problem.createdBy._id] = data.solvedCount;
        } catch (e) {
          counts[problem.createdBy._id] = 0;
        }
      }
    }
    setSolvedCounts(counts);
  };

  const fetchSolvedProblems = async () => {
    try {
      const data = await getMySubmissions({ verdict: 'AC' });
      // Only consider submissions with a valid problem and AC verdict
      const solved = new Set(
        (data.submissions || [])
          .filter(sub => sub.verdict === 'AC' && sub.problem && sub.problem._id)
          .map(sub => sub.problem._id)
      );
      setSolvedProblems(solved);
    } catch (e) {
      setSolvedProblems(new Set());
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { search, difficulty, page, limit: 10 };
      if (selectedTags.length > 0) params.tag = selectedTags;
      const data = await getPublicProblems(params);
      setProblems(data.problems);
      setTotalPages(data.totalPages || 1);
      // Collect all unique tags from the full problem set, not just filtered results
      if (allTags.length === 0) {
      const tags = new Set();
      data.problems.forEach((p) => (p.tags || []).forEach((t) => tags.add(t)));
      setAllTags(Array.from(tags));
      }
      // Fetch solved counts for creators
      await fetchSolvedCounts(data.problems);
      await fetchSolvedProblems();
    } catch (err) {
      setError(err.message || "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line
  }, [search, difficulty, selectedTags]);

  // No additional client-side AND filtering; use backend results directly
  const filteredProblems = problems;

  const solvedCount = problems.filter(p => solvedProblems.has(p._id)).length;

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ background: '#181c24', fontFamily: 'Fira Mono, monospace' }}>
      <CodeBackground />
      <div className="max-w-5xl mx-auto px-4 py-10 relative z-10">
        <Logo />
        <button
          className="mb-6 flex items-center px-4 py-2 bg-[#232b3a] border-2 border-[#00ff99] text-[#00ff99] rounded-lg font-bold shadow hover:bg-[#181c24] hover:text-[#00cfff] transition-all"
          onClick={() => navigate('/')}
        >
          <span className="mr-2 text-2xl">&#8592;</span> Back To Home
        </button>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight text-center mb-8 drop-shadow-lg">Browse Problems</h1>
        <div className="flex justify-center mb-6">
          <span className="bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] px-5 py-2 rounded-full font-bold text-lg shadow-lg border-2 border-[#00ff99] font-mono">
            {solvedCount} / {problems.length} problems solved
          </span>
        </div>
        <div className="flex justify-center items-center mb-8">
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
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
              placeholder="Search problems"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner"
          />
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-48 border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2 items-center">
            <span className="text-[#baffea] font-mono mr-2">Tags:</span>
            <button
              type="button"
              className={`px-3 py-1 rounded-full border-2 font-bold text-xs transition-all duration-150 ${selectedTags.length === 0 ? "bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] border-[#00ff99] shadow-lg" : "bg-[#232b3a] text-[#baffea] border-[#00cfff] hover:bg-[#181c24]"}`}
              onClick={e => { e.preventDefault(); setSelectedTags([]); }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`px-3 py-1 rounded-full border-2 font-bold text-xs transition-all duration-150 ${selectedTags.includes(tag) ? "bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] border-[#00ff99] shadow-lg" : "bg-[#232b3a] text-[#baffea] border-[#00cfff] hover:bg-[#181c24]"}`}
                onClick={e => { e.preventDefault(); setSelectedTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]); }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="text-center py-10 text-[#baffea] font-mono animate-pulse">Loading problems...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-400 font-mono">{error}</div>
        ) : (
          <>
            {filteredProblems.length === 0 ? (
              <div className="text-center py-10 text-[#baffea] font-mono">No problems found.</div>
            ) : (
              <div className="space-y-6">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-6 cursor-pointer hover:border-[#00cfff] hover:shadow-2xl transition-all font-mono group relative"
                onClick={() => navigate(`/problems/${problem._id}`)}
              >
                {/* Solved badge */}
                {solvedProblems.has(problem._id) && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-[#00ff99] z-10 animate-pulse">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Solved
                  </span>
                )}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text group-hover:from-[#00cfff] group-hover:to-[#00ff99] tracking-tight mb-1">{problem.title}</h2>
                    <p className="text-[#baffea] text-sm mt-1 line-clamp-2 font-mono">{problem.statement?.slice(0, 120)}{problem.statement?.length > 120 ? "..." : ""}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 tracking-widest ${problem.difficulty === "Easy" ? "bg-green-900 text-green-300" : problem.difficulty === "Medium" ? "bg-yellow-900 text-yellow-300" : "bg-red-900 text-red-300"}`}>{problem.difficulty}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(problem.tags || []).map((tag) => (
                        <span key={tag} className="inline-block bg-[#181c24] border border-[#00cfff] text-[#00cfff] px-2 py-0.5 rounded-full text-xs font-mono font-bold">{tag}</span>
                      ))}
                    </div>
                    {/* Discussion button for public problems */}
                    {problem.isPublished && (
                      <button
                        className="mt-2 px-4 py-1 rounded bg-[#00cfff] text-[#181c24] font-bold border-2 border-[#00cfff] hover:bg-[#181c24] hover:text-[#00cfff] transition-all"
                        onClick={e => { e.stopPropagation(); navigate(`/problems/${problem._id}/discussion`); }}
                      >
                        Discussion
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseProblems; 