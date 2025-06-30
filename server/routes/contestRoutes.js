import express from 'express';
import Contest from '../models/Contest.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';
import { getContestLeaderboard } from '../controllers/leaderboardController.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// Public: Get all public contests created by admin
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const now = new Date();
    
    let finalQuery = { isPublic: true };

    // If user is logged in, fetch their private contests as well
    if (req.user) {
      finalQuery = {
        $or: [
          { isPublic: true },
          { isPublic: false, allowedUsers: req.user.userId }
        ]
      };
    }

    const fullQuery = { ...finalQuery };

    if (search) {
      fullQuery.title = { $regex: search, $options: 'i' };
    }

    if (status) {
      const statusQuery = {};
      if (status === 'upcoming') {
        statusQuery.startTime = { $gt: now };
      } else if (status === 'active') {
        statusQuery.startTime = { $lte: now };
        statusQuery.endTime = { $gte: now };
      } else if (status === 'ended') {
        statusQuery.endTime = { $lt: now };
      }
      fullQuery.$and = [
        finalQuery,
        statusQuery
      ];
    }
    
    const contests = await Contest.find(fullQuery)
      .populate('createdBy', 'username role')
      .populate('problems', 'title difficulty')
      .sort({ startTime: -1 });

    res.json({ contests });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single contest with user-specific data
router.get('/:id', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems', 'title difficulty')
      .lean(); // Use lean for performance and to modify the object

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check access for private contests
    if (!contest.isPublic && !contest.allowedUsers.includes(req.user.userId)) {
      return res.status(403).json({ message: 'You do not have access to this contest' });
    }

    const userId = req.user.userId;

    // Find user's accepted submissions for this contest's problems
    const problemIds = contest.problems.map(p => p._id);
    const userSubmissions = await Submission.find({
      user: userId,
      problem: { $in: problemIds },
      verdict: 'AC'
    }).select('problem').lean();

    const solvedProblemIds = new Set(userSubmissions.map(s => s.problem.toString()));

    // Add 'solved' status to each problem
    contest.problems = contest.problems.map(problem => ({
      ...problem,
      solved: solvedProblemIds.has(problem._id.toString())
    }));

    res.json({ contest });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for a contest
router.post('/:id/register', protect, async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.userId;
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check access for private contests
    if (!contest.isPublic && !contest.allowedUsers.includes(userId)) {
      return res.status(403).json({ message: 'You are not allowed to register for this private contest' });
    }
    
    if (contest.participants.includes(userId)) {
      return res.status(400).json({ message: 'Already registered for this contest' });
    }
    contest.participants.push(userId);
    await contest.save();
    res.json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister from a contest
router.delete('/:id/register', protect, async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.userId;
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    const idx = contest.participants.indexOf(userId);
    if (idx === -1) {
      return res.status(400).json({ message: 'You are not registered for this contest' });
    }
    contest.participants.splice(idx, 1);
    await contest.save();
    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard for a specific contest
router.get('/:contestId/leaderboard', getContestLeaderboard);

export default router; 