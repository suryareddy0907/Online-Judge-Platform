import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChangePassword from "../components/ChangePassword";
import UserProfile from "../components/UserProfile";
import Leaderboard from "../components/Leaderboard";
import ActivityFeed from "../components/ActivityFeed";
import { 
  Settings, 
  LogOut, 
  Shield, 
  Code, 
  Users, 
  Calendar,
  FileText,
  User,
  Lock,
  Clock
} from "lucide-react";
import { getPublicStats, getPublicContests, getLeaderboard } from '../services/authService';

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

const Home = () => {
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [contests, setContests] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await getPublicStats();
        setStats(data);
      } catch (err) {
        setStatsError(err.message);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        const response = await getLeaderboard({ sortBy: 'rating', limit: 10 });
        setLeaderboardData(response.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setLeaderboardData([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await getPublicContests();
        if (data.contests && data.contests.length > 0) {
          const now = new Date();
          const activeAndUpcoming = data.contests.filter(contest => {
            const startTime = new Date(contest.startTime);
            const endTime = new Date(contest.endTime);
            return (now >= startTime && now <= endTime) || (now < startTime);
          });
          setContests(activeAndUpcoming);
        }
      } catch (err) {
        console.error('Failed to fetch contests:', err);
        setContests([]);
      }
    };
    fetchContests();
  }, []);

  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newCountdowns = {};
      
      contests.forEach(contest => {
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);
        
        if (now < startTime) {
          // Upcoming contest
          const timeLeft = Math.max(0, startTime - now);
          newCountdowns[contest._id] = { type: 'start', timeLeft };
        } else if (now >= startTime && now <= endTime) {
          // Active contest
          const timeLeft = Math.max(0, endTime - now);
          newCountdowns[contest._id] = { type: 'end', timeLeft };
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [contests]);

  // Close dropdown on outside click or on Account button click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle browser back button for UserProfile modal
  useEffect(() => {
    if (!showUserProfile) return;
    const handlePopState = () => {
      setShowUserProfile(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showUserProfile]);

  // Handle browser back button for ChangePassword modal
  useEffect(() => {
    if (!showChangePassword) return;
    const handlePopState = () => {
      setShowChangePassword(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showChangePassword]);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p className="text-lg font-medium">Loading user...</p>
      </div>
    );
  }

  const activeContests = contests.filter(c => getContestStatus(c).status === 'active');
  const upcomingContests = contests.filter(c => getContestStatus(c).status === 'upcoming');

  const openUserProfile = () => {
    window.history.pushState({ modal: 'profile' }, '');
    setShowUserProfile(true);
  };

  const closeUserProfile = () => {
    setShowUserProfile(false);
    if (window.history.state && window.history.state.modal === 'profile') {
      window.history.back();
    }
  };

  const openChangePassword = () => {
    window.history.pushState({ modal: 'changePassword' }, '');
    setShowChangePassword(true);
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
    if (window.history.state && window.history.state.modal === 'changePassword') {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#181c24', fontFamily: 'Fira Mono, monospace' }}>
      <AuroraBackground />
      <MatrixRain />
      {/* Animated code background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-30">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <linearGradient id="homeCodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ff99" />
              <stop offset="100%" stopColor="#00cfff" />
            </linearGradient>
          </defs>
          <text x="50%" y="15%" textAnchor="middle" fontSize="2.5rem" fill="url(#homeCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{`#include <bits/stdc++.h>`}</text>
          <text x="50%" y="30%" textAnchor="middle" fontSize="2.5rem" fill="url(#homeCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{`int main() {`}</text>
          <text x="50%" y="45%" textAnchor="middle" fontSize="2.5rem" fill="url(#homeCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{`    // Welcome to CodersToday!`}</text>
          <text x="50%" y="60%" textAnchor="middle" fontSize="2.5rem" fill="url(#homeCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{`    cout << "Compete. Code. Conquer." << endl;`}</text>
          <text x="50%" y="75%" textAnchor="middle" fontSize="2.5rem" fill="url(#homeCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{`}`}</text>
        </svg>
      </div>

      {/* Navbar */}
      <nav className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center px-2 sm:px-4 md:px-8 py-3 sm:py-4 bg-[#232b3a] shadow-lg border-b-2 border-[#00ff99] gap-2 sm:gap-0" style={{ fontFamily: 'Fira Mono, monospace', boxShadow: '0 0 24px #00ff99, 0 0 48px #00cfff' }}>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text">
            &lt;/&gt; CodersToday
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-6 justify-end">
          <div className="text-right">
            <p className="text-xs sm:text-sm md:text-base font-medium text-[#00ff99] truncate max-w-[120px] sm:max-w-none">Hi, {user.username}!</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tracking-widest ${
              user.role === 'admin' ? 'bg-red-900 text-red-300' :
              user.role === 'moderator' ? 'bg-yellow-900 text-yellow-300' :
              'bg-green-900 text-green-300'
            }`}>
              {user.role}
            </span>
          </div>
          {/* User Actions - View Profile, Change Password, Logout */}
          <button
            onClick={openUserProfile}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md bg-[#181c24] hover:bg-gray-800 border border-[#00ff99] text-[#00ff99] font-mono font-bold transition text-xs sm:text-sm"
            type="button"
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-0 sm:mr-1" />
            <span className="hidden xs:inline sm:block">Profile</span>
          </button>
          <button
            onClick={openChangePassword}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md bg-[#181c24] hover:bg-gray-800 border border-[#00ff99] text-[#00ff99] font-mono font-bold transition text-xs sm:text-sm"
            type="button"
          >
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-0 sm:mr-1" />
            <span className="hidden xs:inline sm:block">Password</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md bg-[#181c24] hover:bg-red-900 border border-[#00ff99] text-red-400 font-mono font-bold transition text-xs sm:text-sm"
            type="button"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-0 sm:mr-1" />
            <span className="hidden xs:inline sm:block">Logout</span>
          </button>
          {user.role === 'admin' && (
            <Link
              to="/admin/users"
              className="inline-flex items-center px-2 sm:px-3 py-2 border-2 border-[#00ff99] text-xs sm:text-sm leading-4 font-bold rounded-md text-[#00ff99] bg-[#181c24] hover:bg-[#232b3a] hover:border-[#00cfff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ff99] font-mono transition"
            >
              <Shield className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline sm:block">Admin</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 relative z-10 w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight mb-2 sm:mb-4" style={{ fontFamily: 'Fira Mono, monospace', textShadow: '0 0 16px #00ff99, 0 0 32px #00cfff' }}>
            &lt;/&gt; Welcome to CodersToday
          </h2>
          <p className="text-base sm:text-lg text-[#baffea] font-mono mb-1 sm:mb-2">The ultimate coding arena for competitive programmers.</p>
          <p className="text-xs sm:text-base text-[#00ff99] font-mono italic">"Where coders become champions."</p>
        </div>

        {/* Contests Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
          {/* Active Contests */}
          <div>
            <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 font-mono text-[#00ff99]">Active Contests</h3>
            {activeContests.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {activeContests.map(contest => (
                  <Link to={`/contests/${contest._id}`} key={contest._id} className="block bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-2xl hover:border-[#00cfff] transition-all font-mono text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="font-semibold text-[#00ff99]">{contest.title}</span>
                      <span className="text-xs sm:text-sm text-[#00ff99] flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Ends in: {countdowns[contest._id] ? formatCountdown(countdowns[contest._id].timeLeft) : '...'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-base">No active contests right now.</p>
            )}
          </div>

          {/* Upcoming Contests */}
          <div>
            <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 font-mono text-[#00cfff]">Upcoming Contests</h3>
            {upcomingContests.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {upcomingContests.map(contest => (
                  <Link to={`/contests/${contest._id}`} key={contest._id} className="block bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-2xl hover:border-[#00ff99] transition-all font-mono text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="font-semibold text-[#00cfff]">{contest.title}</span>
                      <span className="text-xs sm:text-sm text-[#00cfff] flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Starts in: {countdowns[contest._id] ? formatCountdown(countdowns[contest._id].timeLeft) : '...'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-base">No upcoming contests scheduled.</p>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00cfff] transition-all">
            <div className="flex items-center">
              <div className="p-2 bg-[#00ff99]/20 rounded-lg">
                <Code className="h-6 w-6 text-[#00ff99]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#baffea]" title="Total published problems">Published Problems</p>
                <p className="text-2xl font-semibold text-white">
                  {loadingStats ? <span className="animate-pulse">...</span> : statsError ? '-' : stats?.totalProblems ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00ff99] transition-all">
            <div className="flex items-center">
              <div className="p-2 bg-[#00cfff]/20 rounded-lg">
                <FileText className="h-6 w-6 text-[#00cfff]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#baffea]" title="Total submissions made by you">My Submissions</p>
                <p className="text-2xl font-semibold text-white">
                  {loadingStats ? <span className="animate-pulse">...</span> : statsError ? '-' : stats?.totalSubmissions ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00cfff] transition-all">
            <div className="flex items-center">
              <div className="p-2 bg-[#00ff99]/20 rounded-lg">
                <Users className="h-6 w-6 text-[#00ff99]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#baffea]" title="Total active users (excluding banned)">Active Users</p>
                <p className="text-2xl font-semibold text-white">
                  {loadingStats ? <span className="animate-pulse">...</span> : statsError ? '-' : stats?.totalActiveUsers ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00ff99] transition-all">
            <div className="flex items-center">
              <div className="p-2 bg-[#00cfff]/20 rounded-lg">
                <Calendar className="h-6 w-6 text-[#00cfff]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#baffea]" title="Contests that are active or upcoming">Active/Upcoming Contests</p>
                <p className="text-2xl font-semibold text-white">
                  {loadingStats ? <span className="animate-pulse">...</span> : statsError ? '-' : stats?.totalContests ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 font-mono text-white hover:border-[#00cfff] transition-all">
          <h3 className="text-base sm:text-lg font-bold text-[#00ff99] mb-2 sm:mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Link to="/problems" className="flex items-center justify-center px-3 sm:px-4 py-2 border-2 border-[#00ff99] rounded-md text-xs sm:text-sm font-bold text-[#00ff99] bg-[#181c24] hover:bg-[#232b3a] hover:border-[#00cfff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ff99] font-mono transition">
              <Code className="h-4 w-4 mr-2" />
              Browse Problems
            </Link>
            <Link to="/contests" className="flex items-center justify-center px-3 sm:px-4 py-2 border-2 border-[#00cfff] rounded-md text-xs sm:text-sm font-bold text-[#00cfff] bg-[#181c24] hover:bg-[#232b3a] hover:border-[#00ff99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00cfff] font-mono transition">
              <Calendar className="h-4 w-4 mr-2" />
              View Contests
            </Link>
            <Link to="/my-submissions" className="flex items-center justify-center px-3 sm:px-4 py-2 border-2 border-[#00ff99] rounded-md text-xs sm:text-sm font-bold text-[#00ff99] bg-[#181c24] hover:bg-[#232b3a] hover:border-[#00cfff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ff99] font-mono transition">
              <FileText className="h-4 w-4 mr-2" />
              My Submissions
            </Link>
          </div>
        </div>

        {/* Leaderboard and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="md:col-span-1">
            <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-4 sm:p-6 font-mono text-white hover:border-[#00cfff] transition-all">
              <Leaderboard type="global" data={leaderboardData} />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-4 sm:p-6 font-mono text-white hover:border-[#00ff99] transition-all">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showChangePassword && (
        <ChangePassword onClose={closeChangePassword} />
      )}
      
      {showUserProfile && (
        <UserProfile onClose={closeUserProfile} />
      )}
    </div>
  );
};

export default Home;
