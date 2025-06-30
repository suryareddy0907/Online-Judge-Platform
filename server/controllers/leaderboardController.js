import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import Contest from '../models/Contest.js';

// Get leaderboard data
export const getLeaderboard = async (req, res) => {
  try {
    const { sortBy = 'rating', limit = 10 } = req.query;

    const users = await User.find({
      isActive: true,
      isBanned: false
    })
    .select('username rating problemsSolved avatar createdAt')
    .lean();

    const userIds = users.map(u => u._id);
    const acSubmissions = await Submission.find({
      user: { $in: userIds },
      verdict: 'AC'
    }).populate('problem', 'isPublished');

    const userSolvedMap = {};
    users.forEach(user => {
      userSolvedMap[user._id.toString()] = new Set();
    });

    acSubmissions.forEach(sub => {
      if (sub.problem && sub.problem.isPublished) {
        userSolvedMap[sub.user.toString()]?.add(String(sub.problem._id));
      }
    });

    const usersWithData = users.map(user => ({
      ...user,
      problemsSolved: userSolvedMap[user._id.toString()]?.size || 0,
    }));

    usersWithData.sort((a, b) => {
      if (sortBy === 'problemsSolved') {
        if (b.problemsSolved !== a.problemsSolved) {
          return b.problemsSolved - a.problemsSolved;
        }
        return b.rating - a.rating;
      }
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.problemsSolved - a.problemsSolved;
    });
    
    const limitedUsers = usersWithData.slice(0, parseInt(limit));

    const usersWithRank = limitedUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json({
      success: true,
      data: usersWithRank,
      sortBy
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard data'
    });
  }
};

// Get recent activity feed
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentSubmissions = await Submission.find({ verdict: 'AC' })
      .sort({ submittedAt: -1 })
      .populate({
        path: 'problem',
        select: 'title difficulty isPublished',
        match: { isPublished: true } // only published problems
      })
      .populate('user', 'username')
      .limit(parseInt(limit))
      .lean();

    // Filter out submissions for non-published problems
    const activities = recentSubmissions
      .filter(submission => submission.problem) // Filters out submissions where problem is null
      .map(submission => ({
        id: submission._id,
        type: 'problem_solved',
        user: {
          username: submission.user.username
        },
        problem: {
          title: submission.problem.title,
          difficulty: submission.problem.difficulty
        },
        contest: null,
        timestamp: submission.submittedAt,
        message: `${submission.user.username} solved ${submission.problem.title}`,
        language: submission.language,
        executionTime: submission.executionTime
      }));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
};

// Get leaderboard for a specific contest
export const getContestLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId)
      .populate('participants', 'username avatar')
      .populate('problems', '_id')
      .lean();

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found.' });
    }
    
    const problemIds = contest.problems.map(p => p._id);
    if (problemIds.length === 0) {
      return res.json({ success: true, data: [], message: 'No problems in this contest.' });
    }
    
    const participantIds = contest.participants.map(p => p._id);

    const submissions = await Submission.find({
      problem: { $in: problemIds },
      user: { $in: participantIds },
      verdict: 'AC'
    }).lean();

    const leaderboardData = contest.participants.map(participant => {
      const userSubmissions = submissions.filter(s => s.user.equals(participant._id));
      const solvedProblems = new Set(userSubmissions.map(s => s.problem.toString()));
      const score = solvedProblems.size;
      
      let penalty = 0;
      if (score > 0) {
        const lastAcSubmission = userSubmissions
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
        penalty = Math.round((new Date(lastAcSubmission.submittedAt) - new Date(contest.startTime)) / (1000 * 60));
      }

      return {
        _id: participant._id,
        user: {
          username: participant.username,
          avatar: participant.avatar
        },
        score,
        penalty
      };
    });

    leaderboardData.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.penalty - b.penalty;
    });

    const rankedLeaderboard = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.json({ success: true, data: rankedLeaderboard });

  } catch (error) {
    console.error('Error fetching contest leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contest leaderboard' });
  }
}; 