import React from 'react';
import { Trophy, Medal } from 'lucide-react';

const Leaderboard = ({ type, data, contestName, problems = [] }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{rank}</span>;
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 2000) return 'text-red-600 dark:text-red-400';
    if (rating >= 1600) return 'text-orange-600 dark:text-orange-400';
    if (rating >= 1400) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 1200) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  const TableHeader = () => {
    if (type === 'contest') {
      return (
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
          </tr>
        </thead>
      );
    }

    return (
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Solved</th>
        </tr>
      </thead>
    );
  };

  const TableRow = ({ entry, rank }) => {
    if (type === 'contest') {
      return (
        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          <td className="px-6 py-4 whitespace-nowrap">{getRankIcon(entry.rank)}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="font-medium text-gray-900 dark:text-white">{entry.user.username}</div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.score}</td>
        </tr>
      );
    }

    return (
      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
        <td className="px-6 py-4 whitespace-nowrap">{getRankIcon(rank)}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="font-medium text-gray-900 dark:text-white">{entry.username}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.problemsSolved}</td>
      </tr>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          {type === 'contest' ? `${contestName} Leaderboard` : 'Global Leaderboard'}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <TableHeader />
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data && data.map((entry, index) => (
              <TableRow key={entry._id || index} entry={entry} rank={index + 1} />
            ))}
          </tbody>
        </table>
        {(!data || data.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading Ranks.
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
