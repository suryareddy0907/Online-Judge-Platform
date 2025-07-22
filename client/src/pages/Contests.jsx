import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Eye, Trophy, Code } from 'lucide-react';
import { getPublicContests, registerForContest, unregisterForContest } from '../services/authService';
import { useAuth } from '../context/AuthContext';

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

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [searchInput, setSearchInput] = useState('');
  const { user } = useAuth();
  const [registering, setRegistering] = useState({});
  const [registered, setRegistered] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
    // eslint-disable-next-line
  }, [filters]);

  // Debounce search input (10 minutes)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchInput }));
      }
    }, 600000); // 10 minutes in milliseconds
    return () => clearTimeout(handler);
  }, [searchInput, filters.search]);

  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newCountdowns = {};
      
      contests.forEach(contest => {
        const status = getContestStatus(contest);
        if (status.status === 'upcoming') {
          const timeLeft = Math.max(0, new Date(contest.startTime) - now);
          newCountdowns[contest._id] = { type: 'start', timeLeft };
        } else if (status.status === 'active') {
          const timeLeft = Math.max(0, new Date(contest.endTime) - now);
          newCountdowns[contest._id] = { type: 'end', timeLeft };
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [contests]);

  const fetchContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicContests({ search: filters.search, status: filters.status });
      setContests(data.contests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (now < startTime) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', color: 'green', text: 'Active', bgColor: 'bg-green-100', textColor: 'text-green-800' };
    } else {
      return { status: 'ended', color: 'gray', text: 'Ended', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeRemaining = (dateString) => {
    const now = new Date();
    const targetDate = new Date(dateString);
    const diff = targetDate - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format countdown
  const formatCountdown = (ms) => {
    if (ms <= 0) return '0m';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const handleRegister = async (contestId, isRegistered) => {
    if (!user) {
      alert('You must be logged in to register for a contest.');
      return;
    }
    setRegistering(prev => ({ ...prev, [contestId]: true }));
    try {
      if (isRegistered) {
        await unregisterForContest(contestId);
        setRegistered(prev => ({ ...prev, [contestId]: false }));
      } else {
        await registerForContest(contestId);
        setRegistered(prev => ({ ...prev, [contestId]: true }));
      }
      // Optionally, refresh contests to update participants
      fetchContests();
    } catch (err) {
      alert(err.message);
    } finally {
      setRegistering(prev => ({ ...prev, [contestId]: false }));
    }
  };

  const handleJoinContest = (contest) => {
    const isRegistered = registered[contest._id] || (contest.participants && user && contest.participants.includes(user.userId));
    if (!isRegistered) {
      alert('You have not registered for this contest. You cannot participate in this contest');
      return;
    }
    navigate(`/contests/${contest._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181c24] text-white">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-transparent border-b-transparent border-l-[#00ff99] border-r-[#00cfff]"></div>
          <span className="mt-8 text-[#00ff99] font-mono text-lg tracking-widest animate-pulse">Loading Contests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#181c24', fontFamily: 'Fira Mono, monospace' }}>
      <div className="min-h-screen bg-[#181c24] text-white font-mono" style={{ fontFamily: 'Fira Mono, monospace' }}>
        {/* Header */}
        <div className="shadow-md bg-[#232b3a] border-b-2 border-[#00cfff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative flex items-center justify-between">
            {/* Left: CodersToday */}
            <span className="flex items-center font-extrabold text-2xl tracking-tight">
              <span className="bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mr-3">&lt;/&gt;</span>
              <span className="bg-gradient-to-r from-[#f72585] to-[#00cfff] text-transparent bg-clip-text">CodersToday</span>
            </span>
            {/* Center: Title and Description */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight drop-shadow-lg">Coding Contests</h1>
              <p className="text-[#baffea] mt-2 font-mono">Participate in coding competitions and challenges</p>
            </div>
            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user && <span className="text-[#00ff99] font-bold">Hi, {user.username}</span>}
              <Link
                to="/home"
                className="inline-flex items-center px-4 py-2 border-2 border-[#00cfff] rounded-lg text-[#00cfff] bg-[#181c24] hover:bg-[#232b3a] font-bold transition-all"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4 items-end">
            <div className="relative w-full md:w-1/3">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Search contests"
                className="w-full border-2 border-[#00cfff] rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setFilters(prev => ({ ...prev, search: searchInput }));
                  }
                }}
              />
            </div>
            <select
              className="border-2 border-[#00cfff] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99] bg-[#232b3a] text-white font-mono"
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-900/80 border border-red-400 text-red-200 px-4 py-3 rounded mb-6 font-mono">
              {error}
            </div>
          )}

          {/* Contests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contests.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-[#00cfff]" />
                <h3 className="mt-2 text-lg font-bold text-[#00ff99]">No contests found</h3>
                <p className="mt-1 text-base text-[#baffea]">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              contests.map(contest => {
                const status = getContestStatus(contest);
                const isActive = status.status === 'active';
                const isUpcoming = status.status === 'upcoming';
                const countdown = countdowns[contest._id];
                const isRegistered = registered[contest._id] || (contest.participants && user && contest.participants.includes(user.userId));
                
                return (
                  <div
                    key={contest._id}
                    className={`bg-[#232b3a] border-2 rounded-2xl overflow-hidden font-mono transition-all ${
                      isActive ? 'border-[#00ff99]' : isUpcoming ? 'border-[#00cfff]' : 'border-[#baffea]'
                    }`}
                  >
                    {/* Contest Header */}
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight mb-2">
                          {contest.title}
                        </h3>
                      </div>
                      <p className="text-[#baffea] text-base mb-4 line-clamp-2 font-mono">{contest.description}</p>

                      {/* Contest Details */}
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-[#00cfff]">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Start: {formatDateTime(contest.startTime)}</span>
                        </div>
                        <div className="flex items-center text-sm text-[#00cfff]">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>End: {formatDateTime(contest.endTime)}</span>
                        </div>
                        <div className="flex items-center text-sm text-[#00ff99]">
                          <Code className="h-4 w-4 mr-2" />
                          <span>{contest.problems?.length || 0} problems</span>
                        </div>
                        <div className="flex items-center text-sm text-[#00ff99]">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{contest.participants?.length || 0} participants</span>
                        </div>
                      </div>

                      {/* Time Remaining */}
                      {isActive && countdown && (
                        <div className="mt-4 p-3 bg-[#181c24] border-l-4 border-[#00ff99] rounded-md">
                          <div className="flex items-center text-sm text-[#00ff99]">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Ends in: {formatCountdown(countdown.timeLeft)}</span>
                          </div>
                        </div>
                      )}

                      {isUpcoming && countdown && (
                        <div className="mt-4 p-3 bg-[#181c24] border-l-4 border-[#00cfff] rounded-md">
                          <div className="flex items-center text-sm text-[#00cfff]">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Starts in: {formatCountdown(countdown.timeLeft)}</span>
                          </div>
                          {user && (
                            <button
                              className={`mt-3 w-full px-4 py-2 rounded-lg flex items-center justify-center font-bold transition-all border-2 border-[#00cfff] bg-[#181c24] text-[#00cfff] hover:bg-[#232b3a] hover:text-[#00ff99] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#00ff99] ${
                                (registered[contest._id] || (contest.participants && user && contest.participants.includes(user.userId)))
                                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-red-500 hover:to-pink-500 border-none'
                                  : ''
                              }`}
                              disabled={registering[contest._id]}
                              onClick={() => handleRegister(contest._id, registered[contest._id] || (contest.participants && user && contest.participants.includes(user.userId)))}
                            >
                              {registering[contest._id]
                                ? ((registered[contest._id] || (contest.participants && user && contest.participants.includes(user.userId))) ? 'Unregistering...' : 'Registering...')
                                : (registered[contest._id] || (contest.participants && user && contest.participants.includes(user.userId)))
                                  ? 'Unregister'
                                  : 'Register'}
                            </button>
                          )}
                          {!user && (
                            <div className="mt-3 text-[#00cfff] text-center text-sm">
                              Please <Link to="/login" className="underline">login</Link> to register for this contest.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Contest Actions */}
                    <div className="px-8 py-6 bg-[#181c24] border-t-2 border-[#00cfff]">
                      {isActive ? (
                        <button className="w-full bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-bold px-4 py-3 rounded-lg hover:from-[#00cfff] hover:to-[#00ff99] focus:outline-none focus:ring-2 focus:ring-[#00ff99] flex items-center justify-center transition-all"
                          onClick={() => handleJoinContest(contest)}>
                          <Trophy className="h-5 w-5 mr-2 text-[#00cfff]" />
                          Join Contest
                        </button>
                      ) : isUpcoming ? null : (
                        <Link
                          to={`/contests/${contest._id}`}
                          state={{ showResultsAnimation: true }}
                          className="w-full text-center bg-gradient-to-r from-[#00cfff] to-[#00ff99] text-[#181c24] font-bold py-3 px-4 rounded-lg hover:from-[#00ff99] hover:to-[#00cfff] focus:outline-none focus:ring-2 focus:ring-[#00ff99] transition-all shadow-lg"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contests; 