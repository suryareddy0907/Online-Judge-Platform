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

const AdminDashboard = () => {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Problems</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.stats?.totalProblems || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.stats?.totalSubmissions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.stats?.totalContests || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
            </div>
            <div className="p-6">
              {stats?.recentUsers?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent users</p>
              )}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3>
            </div>
            <div className="p-6">
              {stats?.recentSubmissions?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentSubmissions.map((submission) => (
                    <div key={submission._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.user?.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {submission.problem?.title}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-1 ${getVerdictColor(submission.verdict)}`}>
                        {getVerdictIcon(submission.verdict)}
                        <span className="text-sm font-medium">{submission.verdict}</span>
                      </div>
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
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Submission Statistics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {stats.verdictStats.map((stat) => (
                  <div key={stat._id} className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                      stat._id === 'AC' ? 'bg-green-100' :
                      stat._id === 'WA' ? 'bg-red-100' :
                      stat._id === 'TLE' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      <span className={`text-lg font-semibold ${
                        stat._id === 'AC' ? 'text-green-600' :
                        stat._id === 'WA' ? 'text-red-600' :
                        stat._id === 'TLE' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {stat._id}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">{stat.count}</p>
                    <p className="text-xs text-gray-500">submissions</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 