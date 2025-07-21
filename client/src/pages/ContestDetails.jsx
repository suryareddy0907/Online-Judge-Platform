import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getContestDetails, getContestLeaderboard, getMySubmissions } from '../services/authService';
import Leaderboard from '../components/Leaderboard';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';
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
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardLimit, setLeaderboardLimit] = useState(10);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
        const contestData = await getContestDetails(id);
        setContest(contestData.contest);
        if (contestData.contest && contestData.contest.problems && user) {
          const problemIds = contestData.contest.problems.map(p => p._id);
          const submissionsData = await getMySubmissions({ verdict: 'AC' });
          const solvedSet = new Set(
            (submissionsData.submissions || [])
              .filter(sub => sub.verdict === 'AC' && sub.problem && problemIds.includes(sub.problem._id))
              .map(sub => sub.problem._id)
          );
          setSolvedCount(solvedSet.size);
        } else {
          setSolvedCount(0);
        }
      } catch (err) {
        setError('Failed to load contest data');
      } finally {
        setLoading(false);
      }
    };
    fetchContestData();
  }, [id, user]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await getContestLeaderboard(id, {
          page: leaderboardPage,
          limit: leaderboardLimit,
          search: searchQuery.trim()
        });
        setLeaderboard(leaderboardData.data);
        setSearchedUser(leaderboardData.searchedUser || null);
      } catch (err) {
        setLeaderboard([]);
        setSearchedUser(null);
      }
    };
    fetchLeaderboard();
  }, [id, leaderboardPage, leaderboardLimit, searchQuery]);

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
      {contestHasEnded && winner && (
        <div className="my-6 p-4 bg-[#232b3a] border-l-4 border-yellow-400 text-yellow-200 rounded-lg text-center font-mono shadow-lg max-w-3xl mx-auto">
          <p className="font-bold text-xl">🎉 Congratulations to {winner.user.username} for winning the contest! 🎉</p>
        </div>
      )}
      <nav className="w-full flex justify-between items-center px-8 py-6 bg-[#232b3a] border-b-2 border-[#00cfff] shadow-md">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">&lt;/&gt; CodersToday</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-[#00ff99] font-bold">Hi, {user.username}!</span>
            <Link to="/contests" className="px-4 py-2 border-2 border-[#00cfff] rounded-lg text-[#00cfff] bg-[#181c24] hover:bg-[#232b3a] font-bold transition-all">← Back to Contests</Link>
          </div>
        )}
      </nav>
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-4 tracking-tight flex items-center gap-4">{contest.title}
          <span className="flex items-center text-lg font-bold text-[#00cfff] ml-4">
            <Clock className="h-6 w-6 mr-2" /> {clock}
          </span>
        </h1>
        <p className="mb-8 text-[#baffea] text-lg font-mono">{contest.description}</p>
        <div className="mb-4 flex justify-center">
          <span className="bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] px-5 py-2 rounded-full font-bold text-lg shadow-lg border-2 border-[#00ff99] font-mono">
            {solvedCount} / {contest.problems.length} problems solved
          </span>
        </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <form
              className="flex items-center gap-2"
              onSubmit={e => { e.preventDefault(); setLeaderboardPage(1); setSearchQuery(searchInput); }}
            >
              <input
                type="text"
                placeholder="Search username"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="px-3 py-1 rounded border-2 border-[#00cfff] bg-[#181c24] text-[#baffea] font-mono focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              />
              <button type="submit" className="px-3 py-1 rounded bg-[#00cfff] text-[#181c24] font-bold">Search</button>
            </form>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                className="px-2 py-1 rounded bg-[#00cfff] text-[#181c24] font-bold disabled:opacity-50"
                onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                disabled={leaderboardPage === 1}
              >Prev</button>
              <span className="text-[#baffea] font-mono">Page {leaderboardPage}</span>
              <button
                className="px-2 py-1 rounded bg-[#00ff99] text-[#181c24] font-bold disabled:opacity-50"
                onClick={() => setLeaderboardPage(p => p + 1)}
                disabled={leaderboard.length < leaderboardLimit}
              >Next</button>
            </div>
          </div>
          <Leaderboard 
            type="contest"
            data={leaderboard}
            contestName={contest.title}
            problems={contest.problems}
          />
          {searchedUser && (
            <div className="mt-4 p-3 bg-[#181c24] border-2 border-[#00cfff] rounded-lg text-[#baffea] font-mono">
              <span className="font-bold">{searchedUser.user.username}</span> is ranked <span className="font-bold">#{searchedUser.rank}</span> with <span className="font-bold">{searchedUser.score}</span> solved problems.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestDetails; 