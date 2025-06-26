import express from "express";
import { getPublicProblems, submitProblem, getMySubmissions } from "../controllers/problemController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Get all published problems
router.get("/", getPublicProblems);

// User: Submit a solution
router.post("/:id/submit", protect, submitProblem);

// User: Get their own submissions
router.get("/my-submissions", protect, getMySubmissions);

export default router; 