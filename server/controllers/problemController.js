import Problem from "../models/Problem.js";

// GET /api/problems - public, published only
export const getPublicProblems = async (req, res) => {
  try {
    const { search = "", difficulty = "", tag = "" } = req.query;
    const query = { isPublished: true };
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (tag) {
      query.tags = tag;
    }
    const problems = await Problem.find(query).sort({ createdAt: -1 });
    res.json({ problems });
  } catch (err) {
    console.error("Get public problems error:", err);
    res.status(500).json({ message: "Server error" });
  }
}; 