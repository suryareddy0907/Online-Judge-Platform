import React, { useState, useEffect } from 'react';
import { Activity, Clock, Code, CheckCircle } from 'lucide-react';
import { getRecentActivity, socket } from '../services/authService';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    socket.on('activityUpdate', (activity) => {
      setActivities(prev => [activity, ...prev.slice(0, 14)]); // keep max 15
    });
    return () => {
      clearInterval(interval);
      socket.off('activityUpdate');
    };
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await getRecentActivity({ limit: 15 });
      setActivities(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'hard':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getLanguageIcon = (language) => {
    const languageMap = {
      'c': 'C',
      'cpp': 'C++',
      'java': 'Java',
      'python': 'Python'
    };
    return languageMap[language] || language;
  };

  const getLanguageColor = (language) => {
    const colorMap = {
      'c': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'cpp': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'java': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'python': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };
    return colorMap[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 mb-4">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-green-500" />
          Recent Activity
        </h3>
        <button
          onClick={fetchActivity}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {activity.user.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {activity.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.user.username}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  solved
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  {activity.problem.title}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeAgo(activity.timestamp)}</span>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(activity.language)}`}>
                  {getLanguageIcon(activity.language)}
                </span>
                
                {activity.problem.difficulty && (
                  <span className={`font-medium ${getDifficultyColor(activity.problem.difficulty)}`}>
                    {activity.problem.difficulty}
                  </span>
                )}
                
                {activity.executionTime && (
                  <span className="flex items-center space-x-1">
                    <Code className="h-3 w-3" />
                    <span>{activity.executionTime}ms</span>
                  </span>
                )}
              </div>
            </div>

            {/* Success Icon */}
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Be the first to solve a problem!
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 