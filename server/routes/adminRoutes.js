import express from "express";
import { requireAdmin, requireAdminOrModerator } from "../middlewares/adminMiddleware.js";
import {
  // User Management
  getAllUsers,
  updateUserRole,
  toggleUserBan,
  deleteUser,
  
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
  
  // Contest Management
  getAllContests,
  createContest,
  updateContest,
  deleteContest,
  
  // Dashboard
  getDashboardStats
} from "../controllers/adminController.js";

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// ==================== DASHBOARD ====================
router.get("/dashboard", getDashboardStats);

// ==================== USER MANAGEMENT ====================
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/ban", toggleUserBan);
router.delete("/users/:userId", deleteUser);

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

// ==================== CONTEST MANAGEMENT ====================
router.get("/contests", getAllContests);
router.post("/contests", createContest);
router.put("/contests/:contestId", updateContest);
router.delete("/contests/:contestId", deleteContest);

export default router; 