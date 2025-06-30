import express from "express";
import { requireAdmin, requireAdminOrModerator } from "../middlewares/adminMiddleware.js";
import {
  // User Management
  getAllUsers,
  updateUserRole,
  toggleUserBan,
  deleteUser,
  updateUserDetails,
  
  // Problem Management
  getAllProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  toggleProblemPublish,
  
  // Submission Management
  getAllSubmissions,
  getSubmissionDetails,
  rejudgeSubmission,
  deleteSubmission,
  
  // Contest Management
  getAllContests,
  createContest,
  updateContest,
  deleteContest,
  
  // Dashboard
  getDashboardStats,
  getPublicStats,
  getUserSolvedCount,
  syncContestProblems
} from "../controllers/adminController.js";
import { optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Home page stats
router.get("/public-stats", optionalAuth, getPublicStats);

// Apply admin middleware to all routes
router.use(requireAdmin);

// ==================== DASHBOARD ====================
router.get("/dashboard", getDashboardStats);

// ==================== USER MANAGEMENT ====================
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/ban", toggleUserBan);
router.delete("/users/:userId", deleteUser);
router.put("/users/:userId", updateUserDetails);

// ==================== PROBLEM MANAGEMENT ====================
router.get("/problems", getAllProblems);
router.post("/problems", createProblem);
router.put("/problems/:problemId", updateProblem);
router.delete("/problems/:problemId", deleteProblem);
router.patch("/problems/:problemId/publish", toggleProblemPublish);

// ==================== SUBMISSION MANAGEMENT ====================
router.get("/submissions", getAllSubmissions);
router.get("/submissions/:submissionId", getSubmissionDetails);
router.post("/submissions/:submissionId/rejudge", rejudgeSubmission);
router.delete("/submissions/:submissionId", deleteSubmission);

// ==================== CONTEST MANAGEMENT ====================
router.get("/contests", getAllContests);
router.post("/contests", createContest);
router.put("/contests/:contestId", updateContest);
router.delete("/contests/:contestId", deleteContest);

// Get number of unique problems solved by a user
router.get("/user/:userId/solved-count", getUserSolvedCount);

// TEMPORARY: Utility route to sync contest field for all problems
router.post('/sync-contest-problems', syncContestProblems);

export default router; 