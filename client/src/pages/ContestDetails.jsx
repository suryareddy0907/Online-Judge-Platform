import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clock, setClock] = useState('');
  const [runConfetti, setRunConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: false, state: { from: location } });
    }
  }, [user, navigate, location]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#181c24] text-[#00ff99] font-mono animate-pulse">Loading...</div>;
  if (error || !contest) return <div className="min-h-screen flex items-center justify-center text-red-500 bg-[#181c24] font-mono">{error || 'Contest not found'}</div>;

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
    <div className="min-h-screen bg-[#181c24] text-white font-mono" style={{ fontFamily: 'Fira Mono, monospace' }}>
      <nav className="w-full flex justify-between items-center px-8 py-6 bg-[#232b3a] border-b-2 border-[#00cfff] shadow-md">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">&lt;/&gt; CodersToday</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-[#00ff99] font-bold">Hi, {user.username}!</span>
            <Link to="/contests" className="px-4 py-2 border-2 border-[#00cfff] rounded-lg text-[#00cfff] bg-[#181c24] hover:bg-[#232b3a] font-bold transition-all">← Back to Contests</Link>
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
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-4 tracking-tight flex items-center gap-4">{contest.title}
          <span className="flex items-center text-lg font-bold text-[#00cfff] ml-4">
            <Clock className="h-6 w-6 mr-2" /> {clock}
          </span>
        </h1>
        {runConfetti && winner && (
          <div className="my-6 p-4 bg-[#232b3a] border-l-4 border-yellow-400 text-yellow-200 rounded-lg text-center font-mono shadow-lg">
            <p className="font-bold text-xl">🎉 Congratulations to {winner.user.username} for winning the contest! 🎉</p>
          </div>
        )}
        <p className="mb-8 text-[#baffea] text-lg font-mono">{contest.description}</p>
        <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">Problems</h2>
        <ul className="mb-12 space-y-4">
          {contest.problems && contest.problems.length > 0 ? (
            contest.problems.map((problem) => (
              <li key={problem._id} className={`bg-[#232b3a] border-2 rounded-xl p-4 shadow flex items-center justify-between font-mono transition-all ${problem.solved ? 'border-[#00ff99]' : 'border-[#00cfff]'}`}>
                <Link to={`/problems/${problem._id}`} className={`font-bold text-lg ${problem.solved ? 'text-[#00ff99]' : 'text-[#00cfff]'} hover:underline`}>
                  {problem.title}
                </Link>
              </li>
            ))
          ) : (
            <li className="text-[#baffea]">No problems found for this contest.</li>
          )}
        </ul>
        <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">Leaderboard</h2>
        <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl p-6 shadow-lg font-mono">
          <Leaderboard 
            type="contest"
            data={leaderboard}
            contestName={contest.title}
            problems={contest.problems}
          />
        </div>
      </div>
    </div>
  );
};

export default ContestDetails; 