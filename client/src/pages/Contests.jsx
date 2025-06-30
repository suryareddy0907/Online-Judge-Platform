import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Eye, Trophy, Code } from 'lucide-react';
import { getPublicContests, registerForContest, unregisterForContest } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const { user } = useAuth();
  const [registering, setRegistering] = useState({});
  const [registered, setRegistered] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
    // eslint-disable-next-line
  }, [filters]);

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="shadow-md" style={{ backgroundColor: '#232e3e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative flex items-center justify-between">
          {/* Left: CodersToday */}
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
            <span style={{ color: '#a259f7', fontWeight: 700, marginRight: 4 }}>&lt;/&gt;</span>
            <span style={{ color: '#f72585', fontWeight: 700 }}>CodersToday</span>
          </span>
          {/* Center: Title and Description */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-3xl font-bold text-white">Coding Contests</h1>
            <p className="text-gray-300 mt-2">Participate in coding competitions and challenges</p>
          </div>
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user && <span className="text-white">Hi, {user.username}</span>}
            <Link
              to="/home"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-end">
          <input
            type="text"
            placeholder="Search contests..."
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Contests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No contests found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 ${
                    isActive ? 'border-green-500' : isUpcoming ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  {/* Contest Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {contest.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {contest.description}
                    </p>

                    {/* Contest Details */}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Start: {formatDateTime(contest.startTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>End: {formatDateTime(contest.endTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Code className="h-4 w-4 mr-2" />
                        <span>{contest.problems?.length || 0} problems</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{contest.participants?.length || 0} participants</span>
                      </div>
                    </div>

                    {/* Time Remaining */}
                    {isActive && countdown && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <div className="flex items-center text-sm text-green-700 dark:text-green-400">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Ends in: {formatCountdown(countdown.timeLeft)}</span>
                        </div>
                      </div>
                    )}

                    {isUpcoming && countdown && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <div className="flex items-center text-sm text-blue-700 dark:text-blue-400">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Starts in: {formatCountdown(countdown.timeLeft)}</span>
                        </div>
                        {user && (
                          <button
                            className={`mt-3 w-full px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              (registered[contest._id] || (contest.participants && user && contest.participants.includes(user.userId)))
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
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
                          <div className="mt-3 text-blue-700 dark:text-blue-300 text-center text-sm">
                            Please <Link to="/login" className="underline">login</Link> to register for this contest.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contest Actions */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                    {isActive ? (
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
                        onClick={() => handleJoinContest(contest)}>
                        <Trophy className="h-4 w-4 mr-2" />
                        Join Contest
                      </button>
                    ) : isUpcoming ? null : (
                      <Link
                        to={`/contests/${contest._id}`}
                        state={{ showResultsAnimation: true }}
                        className="w-full text-center bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
  );
};

export default Contests; 