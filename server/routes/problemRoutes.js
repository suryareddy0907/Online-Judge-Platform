import express from "express";
import { getPublicProblems, submitProblem, getMySubmissions, getProblemById } from "../controllers/problemController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { getDiscussion, postComment, deleteComment, editComment } from '../controllers/discussionController.js';

const router = express.Router();

// Public: Get all published problems
router.get("/", getPublicProblems);

// User: Submit a solution
router.post("/:id/submit", protect, submitProblem);

// User: Get their own submissions
router.get("/my-submissions", protect, getMySubmissions);

// User: Get a problem by ID (including draft) if authenticated
router.get('/:id', protect, getProblemById);

// Discussion routes
router.get('/:id/discussion', getDiscussion);
router.post('/:id/discussion', postComment);
router.delete('/discussion/:commentId', deleteComment);
router.patch('/discussion/:commentId', editComment);

export default router; 