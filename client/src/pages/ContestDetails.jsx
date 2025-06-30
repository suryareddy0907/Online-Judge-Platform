import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getContestDetails, getContestLeaderboard } from '../services/authService';
import Leaderboard from '../components/Leaderboard';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const ContestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clock, setClock] = useState('');
  const [runConfetti, setRunConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const fetchContestData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contestData, leaderboardData] = await Promise.all([
          getContestDetails(id),
          getContestLeaderboard(id)
        ]);
        setContest(contestData.contest);
        setLeaderboard(leaderboardData.data);

        if (location.state?.showResultsAnimation) {
          const contestHasEnded = new Date() > new Date(contestData.contest.endTime);
          if (contestHasEnded) {
            setRunConfetti(true);
          }
        }
      } catch (err) {
        setError('Failed to load contest data');
      } finally {
        setLoading(false);
      }
    };
    fetchContestData();
  }, [id, location.state]);

  useEffect(() => {
    if (!contest) return;

    const updateClock = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);
      let diff, label;
      
      if (now < start) {
        diff = start - now;
        label = 'Starts in';
      } else if (now >= start && now <= end) {
        diff = end - now;
        label = 'Ends in';
      } else {
        setClock('Contest Ended');
        return;
      }

      if (diff <= 0) {
        setClock('Contest Ended');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      let timeStr = '';
      if (days > 0) timeStr += `${days}d `;
      if (hours > 0 || days > 0) timeStr += `${hours}h `;
      timeStr += `${minutes}m ${seconds}s`;
      setClock(`${label}: ${timeStr}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !contest) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Contest not found'}</div>;

  const contestHasEnded = new Date() > new Date(contest.endTime);
  const isRegistered = user && contest.participants && contest.participants.includes(user.userId);
  const winner = leaderboard && leaderboard.length > 0 ? leaderboard.find(p => p.rank === 1) : null;
  
  if (!isRegistered && !contestHasEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg font-semibold">
        You have not registered for this contest. You cannot participate in this contest.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            &lt;/&gt; CodersToday
          </span>
        </h1>
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm sm:text-base font-medium">
                Hi, {user.username}!
              </p>
            </div>
          </div>
        )}
      </nav>
      {runConfetti && (
        <Confetti
          width={width}
          height={height}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
        />
      )}
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-4">{contest.title}
          <span className="flex items-center text-base font-normal text-blue-600 dark:text-blue-400 ml-4">
            <Clock className="h-5 w-5 mr-1" /> {clock}
          </span>
        </h1>
        {runConfetti && winner && (
          <div className="my-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg text-center">
            <p className="font-bold text-lg">🎉 Congratulations to {winner.user.username} for winning the contest! 🎉</p>
          </div>
        )}
        <p className="mb-4 text-gray-600 dark:text-gray-400">{contest.description}</p>
        <h2 className="text-xl font-semibold mb-2">Problems</h2>
        <ul className="mb-8 space-y-2">
          {contest.problems && contest.problems.length > 0 ? (
            contest.problems.map((problem) => (
              <li key={problem._id} className={`bg-white dark:bg-gray-800 rounded p-4 shadow flex items-center justify-between ${problem.solved ? 'border-l-4 border-green-500' : ''}`}>
                <Link to={`/problems/${problem._id}`} className={`font-medium ${problem.solved ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'} hover:underline`}>
                  {problem.title}
                </Link>
              </li>
            ))
          ) : (
            <li>No problems found for this contest.</li>
          )}
        </ul>
        <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
        <Leaderboard 
          type="contest"
          data={leaderboard}
          contestName={contest.title}
          problems={contest.problems}
        />
      </div>
    </div>
  );
};

export default ContestDetails; 