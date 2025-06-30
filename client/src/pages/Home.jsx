import React, { useState, useEffect } from "react";
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
        // ignore for now
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
        // ignore for now
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

  const handleLogout = () => {
    logout();
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            &lt;/&gt; CodersToday
          </span>
        </h1>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm sm:text-base font-medium">
              Hi, {user.username}!
            </p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.role === 'admin' ? 'bg-red-100 text-red-800' :
              user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role}
            </span>
          </div>
          
          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <User className="h-5 w-5" />
              <span className="hidden sm:block">Account</span>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button
                onClick={() => setShowUserProfile(true)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="inline h-4 w-4 mr-2" />
                View Profile
              </button>
              <button
                onClick={() => setShowChangePassword(true)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Lock className="inline h-4 w-4 mr-2" />
                Change Password
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-600" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="inline h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
          
          {user.role === 'admin' && (
            <Link
              to="/admin/users"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to CodersToday
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your online coding platform for competitive programming
          </p>
        </div>

        {/* Contests Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Active Contests */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Active Contests</h3>
            {activeContests.length > 0 ? (
              <div className="space-y-4">
                {activeContests.map(contest => (
                  <Link to={`/contests/${contest._id}`} key={contest._id} className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{contest.title}</span>
                      <span className="text-sm text-green-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Ends in: {countdowns[contest._id] ? formatCountdown(countdowns[contest._id].timeLeft) : '...'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No active contests right now.</p>
            )}
          </div>

          {/* Upcoming Contests */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Upcoming Contests</h3>
            {upcomingContests.length > 0 ? (
              <div className="space-y-4">
                {upcomingContests.map(contest => (
                  <Link to={`/contests/${contest._id}`} key={contest._id} className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{contest.title}</span>
                      <span className="text-sm text-blue-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Starts in: {countdowns[contest._id] ? formatCountdown(countdowns[contest._id].timeLeft) : '...'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming contests scheduled.</p>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400" title="Total published problems">Published Problems</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loadingStats ? <span className="animate-pulse">...</span> : statsError ? '-' : stats?.totalProblems ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400" title="Total submissions made by you">My Submissions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loadingStats ? <span className="animate-pulse">...</span> : statsError ? '-' : stats?.totalSubmissions ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400" title="Total registered users">Registered Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loadingStats ? <span className="animate-pulse">...</span> : statsError ? '-' : stats?.totalUsers ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400" title="Contests that are active or upcoming">Active/Upcoming Contests</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loadingStats ? <span className="animate-pulse">...</span> : statsError ? '-' : stats?.totalContests ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/problems" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Code className="h-4 w-4 mr-2" />
              Browse Problems
            </Link>
            <Link to="/contests" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Calendar className="h-4 w-4 mr-2" />
              View Contests
            </Link>
            <Link to="/my-submissions" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <FileText className="h-4 w-4 mr-2" />
              My Submissions
            </Link>
          </div>
        </div>

        {/* Leaderboard and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <Leaderboard type="global" data={leaderboardData} />
            </div>
          </div>
          <ActivityFeed />
        </div>
      </div>

      {/* Modals */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
      
      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}
    </div>
  );
};

export default Home;
