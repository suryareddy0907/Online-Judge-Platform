import express from "express";
import { getPublicProblems, submitProblem, getMySubmissions, getProblemById, getMySubmissionsForProblem } from "../controllers/problemController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Get all published problems
router.get("/", getPublicProblems);

// User: Submit a solution
router.post("/:id/submit", protect, submitProblem);

// User: Get their own submissions
router.get("/my-submissions", protect, getMySubmissions);
// User: Get their own submissions for a specific problem
router.get("/:problemId/my-submissions", protect, getMySubmissionsForProblem);

// User: Get a problem by ID (including draft) if authenticated
router.get('/:id', protect, getProblemById);

export default router; 