import express from "express";
import { getPublicProblems } from "../controllers/problemController.js";

const router = express.Router();

// Public: Get all published problems
router.get("/", getPublicProblems);

export default router; 