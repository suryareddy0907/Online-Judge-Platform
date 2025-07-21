import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/adminService';
import { 
  Users, 
  FileText, 
  Code, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const CodeBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-30">
    <svg width="100%" height="100%" className="absolute inset-0">
      <defs>
        <linearGradient id="adminCodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff99" />
          <stop offset="100%" stopColor="#00cfff" />
        </linearGradient>
      </defs>
      <text x="50%" y="20%" textAnchor="middle" fontSize="2.5rem" fill="url(#adminCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"// Admin Panel"}</text>
      <text x="50%" y="40%" textAnchor="middle" fontSize="2.5rem" fill="url(#adminCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"const admin = true;"}</text>
      <text x="50%" y="60%" textAnchor="middle" fontSize="2.5rem" fill="url(#adminCodeGradient)" fontFamily="Fira Mono, monospace" opacity="0.18">{"// Secure. Powerful. Efficient."}</text>
    </svg>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      navigate('/home', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181c24]">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-transparent border-b-transparent border-l-[#00ff99] border-r-[#00cfff] shadow-lg" style={{ boxShadow: '0 0 32px #00ff99, 0 0 64px #00cfff' }}></div>
          <span className="mt-8 text-[#00ff99] font-mono text-lg tracking-widest animate-pulse drop-shadow-lg">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'AC': return 'text-green-600';
      case 'WA': return 'text-red-600';
      case 'TLE': return 'text-yellow-600';
      case 'MLE': return 'text-orange-600';
      case 'RE': return 'text-purple-600';
      case 'CE': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'AC': return <CheckCircle className="h-4 w-4" />;
      case 'WA': return <XCircle className="h-4 w-4" />;
      case 'TLE': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ background: '#181c24', fontFamily: 'Fira Mono, monospace' }}>
        <CodeBackground />
        {/* Header */}
        <div className="bg-[#232b3a] shadow-lg border-b-2 border-[#00ff99] px-2 sm:px-4 md:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0" style={{ boxShadow: '0 0 24px #00ff99, 0 0 48px #00cfff' }}>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight mb-1">Admin Dashboard</h1>
            <p className="text-[#baffea] font-mono text-xs sm:text-base">Welcome back, {user?.username}!</p>
          </div>
          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold tracking-widest ${user?.role === 'admin' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>{user?.role}</span>
        </div>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 relative z-10 w-full">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00cfff] transition-all">
              <div className="flex items-center">
                <div className="p-2 bg-[#00ff99]/20 rounded-lg">
                  <Users className="h-6 w-6 text-[#00ff99]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#baffea]">Total Users</p>
                  <p className="text-2xl font-semibold text-white">{stats?.stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00ff99] transition-all">
              <div className="flex items-center">
                <div className="p-2 bg-[#00cfff]/20 rounded-lg">
                  <FileText className="h-6 w-6 text-[#00cfff]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#baffea]">Total Problems</p>
                  <p className="text-2xl font-semibold text-white">{stats?.stats?.totalProblems || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00cfff] transition-all">
              <div className="flex items-center">
                <div className="p-2 bg-[#00ff99]/20 rounded-lg">
                  <Code className="h-6 w-6 text-[#00ff99]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#baffea]">Total Submissions</p>
                  <p className="text-2xl font-semibold text-white">{stats?.stats?.totalSubmissions || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00ff99] transition-all">
              <div className="flex items-center">
                <div className="p-2 bg-[#00cfff]/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-[#00cfff]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#baffea]">Total Contests</p>
                  <p className="text-2xl font-semibold text-white">{stats?.stats?.totalContests || 0}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Recent Users & Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            <div className="bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00cfff] transition-all">
              <div className="border-b border-[#00ff99]/30 pb-2 mb-4">
                <h3 className="text-lg font-bold text-[#00ff99]">Recent Users</h3>
              </div>
              <div>
                {stats?.recentUsers?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-sm text-[#baffea]">{user.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-widest ${user.role === 'admin' ? 'bg-red-900 text-red-300' : user.role === 'moderator' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>{user.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent users</p>
                )}
              </div>
            </div>
            <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 font-mono text-white hover:border-[#00ff99] transition-all">
              <div className="border-b border-[#00cfff]/30 pb-2 mb-4">
                <h3 className="text-lg font-bold text-[#00cfff]">Recent Submissions</h3>
              </div>
              <div>
                {stats?.recentSubmissions?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentSubmissions.map((submission) => (
                      <div key={submission._id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{submission.user?.username}</p>
                          <p className="text-sm text-[#baffea]">{submission.problem?.title}</p>
                        </div>
                        <div className={`flex items-center space-x-1 ${getVerdictColor(submission.verdict)}`}>{getVerdictIcon(submission.verdict)}<span className="text-sm font-medium">{submission.verdict}</span></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent submissions</p>
                )}
              </div>
            </div>
          </div>
          {/* Submission Statistics */}
          {stats?.verdictStats && stats.verdictStats.length > 0 && (
            <div className="mt-6 sm:mt-8 bg-[#232b3a] border-2 border-[#00ff99] rounded-xl shadow-lg p-4 sm:p-6 font-mono text-white hover:border-[#00cfff] transition-all">
              <div className="border-b border-[#00ff99]/30 pb-2 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-[#00ff99]">Submission Statistics</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                {stats.verdictStats.map((stat) => (
                  <div key={stat._id} className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat._id === 'AC' ? 'bg-green-900' : stat._id === 'WA' ? 'bg-red-900' : stat._id === 'TLE' ? 'bg-yellow-900' : 'bg-gray-900'}`}> <span className={`text-lg font-semibold ${stat._id === 'AC' ? 'text-green-300' : stat._id === 'WA' ? 'text-red-300' : stat._id === 'TLE' ? 'text-yellow-300' : 'text-gray-300'}`}>{stat._id}</span></div>
                    <p className="mt-2 text-sm font-medium text-white">{stat.count}</p>
                    <p className="text-xs text-[#baffea]">submissions</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 