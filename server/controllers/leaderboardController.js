import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import Contest from '../models/Contest.js';

// Get leaderboard data
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "" } = req.query;

    const users = await User.find({
      isActive: true,
      isBanned: false
    })
    .select('username problemsSolved avatar createdAt')
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

    // For each user, find the time when they reached their current problemsSolved count (earliest last AC submission for their last unique problem)
    const userLastSolvedTime = {};
    users.forEach(user => {
      const userACs = acSubmissions.filter(sub => String(sub.user) === String(user._id) && sub.problem && sub.problem.isPublished);
      // Map: problemId -> earliest AC submission time
      const problemToTime = {};
      userACs.forEach(sub => {
        const pid = String(sub.problem._id);
        if (!problemToTime[pid] || new Date(sub.submittedAt) < new Date(problemToTime[pid])) {
          problemToTime[pid] = sub.submittedAt;
        }
      });
      // The time when the user reached their current problemsSolved count is the latest among their earliest ACs for each unique problem
      const times = Object.values(problemToTime).map(t => new Date(t));
      if (times.length > 0) {
        userLastSolvedTime[user._id.toString()] = new Date(Math.max(...times.map(t => t.getTime())));
      } else {
        userLastSolvedTime[user._id.toString()] = null;
      }
    });

    const usersWithData = users.map(user => ({
      ...user,
      problemsSolved: userSolvedMap[user._id.toString()]?.size || 0,
      lastSolvedAt: userLastSolvedTime[user._id.toString()] // may be null
    }));

    usersWithData.sort((a, b) => {
      if (b.problemsSolved !== a.problemsSolved) {
        return b.problemsSolved - a.problemsSolved;
      }
      if (a.lastSolvedAt && b.lastSolvedAt) {
        return a.lastSolvedAt - b.lastSolvedAt;
      }
      if (a.lastSolvedAt) return -1;
      if (b.lastSolvedAt) return 1;
      return a.username.localeCompare(b.username);
    });
    
    // Pagination
    const totalUsers = usersWithData.length;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const totalPages = Math.ceil(totalUsers / limitInt);
    const paginatedUsers = usersWithData.slice((pageInt - 1) * limitInt, pageInt * limitInt);

    // Add rank to paginated users
    const usersWithRank = paginatedUsers.map((user, index) => ({
      ...user,
      rank: (pageInt - 1) * limitInt + index + 1
    }));

    // User search
    let searchedUser = null;
    if (search) {
      const foundIndex = usersWithData.findIndex(u => u.username.toLowerCase() === search.toLowerCase());
      if (foundIndex !== -1) {
        searchedUser = {
          ...usersWithData[foundIndex],
          rank: foundIndex + 1
        };
      }
    }

    res.json({
      success: true,
      data: usersWithRank,
      totalUsers,
      totalPages,
      currentPage: pageInt,
      searchedUser
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
    const { page = 1, limit = 10, search = "" } = req.query;

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

    // For each participant, find their solved problems and the time they reached their current solved count (earliest last AC submission for their last unique problem)
    const leaderboardData = contest.participants.map(participant => {
      const userSubmissions = submissions.filter(s => String(s.user) === String(participant._id));
      // Map: problemId -> earliest AC submission time
      const problemToTime = {};
      userSubmissions.forEach(sub => {
        const pid = String(sub.problem);
        if (!problemToTime[pid] || new Date(sub.submittedAt) < new Date(problemToTime[pid])) {
          problemToTime[pid] = sub.submittedAt;
        }
      });
      const solvedProblems = Object.keys(problemToTime);
      const score = solvedProblems.length;
      // The time when the user reached their current solved count is the latest among their earliest ACs for each unique problem
      const times = Object.values(problemToTime).map(t => new Date(t));
      let lastSolvedAt = null;
      if (times.length > 0) {
        lastSolvedAt = new Date(Math.max(...times.map(t => t.getTime())));
      }
      return {
        _id: participant._id,
        user: {
          username: participant.username,
          avatar: participant.avatar
        },
        score,
        lastSolvedAt
      };
    });

    // Sort: by score desc, then by earliest lastSolvedAt, then by username
    leaderboardData.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.lastSolvedAt && b.lastSolvedAt) {
        return a.lastSolvedAt - b.lastSolvedAt;
      }
      if (a.lastSolvedAt) return -1;
      if (b.lastSolvedAt) return 1;
      return a.user.username.localeCompare(b.user.username);
    });

    // Pagination
    const totalUsers = leaderboardData.length;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const totalPages = Math.ceil(totalUsers / limitInt);
    const paginated = leaderboardData.slice((pageInt - 1) * limitInt, pageInt * limitInt);

    // Add rank to paginated users
    const rankedLeaderboard = paginated.map((entry, index) => ({
      ...entry,
      rank: (pageInt - 1) * limitInt + index + 1
    }));

    // User search
    let searchedUser = null;
    if (search) {
      const foundIndex = leaderboardData.findIndex(u => u.user.username.toLowerCase() === search.toLowerCase());
      if (foundIndex !== -1) {
        searchedUser = {
          ...leaderboardData[foundIndex],
          rank: foundIndex + 1
        };
      }
    }

    res.json({
      success: true,
      data: rankedLeaderboard,
      totalUsers,
      totalPages,
      currentPage: pageInt,
      searchedUser
    });
  } catch (error) {
    console.error('Error fetching contest leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contest leaderboard' });
  }
}; 