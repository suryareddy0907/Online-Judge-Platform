import express from 'express';
import { getLeaderboard, getRecentActivity } from '../controllers/leaderboardController.js';

const router = express.Router();

// Get leaderboard
router.get('/', getLeaderboard);

// Get recent activity
router.get('/activity', getRecentActivity);

export default router; 