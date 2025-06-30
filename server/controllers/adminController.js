import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import Contest from "../models/Contest.js";
import mongoose from "mongoose";

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filters
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "", status = "" } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'active') {
      query.isBanned = false;
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Ban/Unban user
export const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBanned } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`, 
      user 
    });
  } catch (error) {
    console.error("Toggle user ban error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if trying to delete the default admin
    if (user.email === "suryareddy0907@gmail.com") {
      return res.status(403).json({ message: "Cannot delete the default admin user" });
    }

    await User.findByIdAndDelete(userId);
    
    // Also delete user's submissions
    await Submission.deleteMany({ user: userId });

    // Emit leaderboard update after user deletion
    const io = req.app.get('io');
    const updatedLeaderboard = await User.find()
      .select('username problemsSolved rating avatar createdAt')
      .sort({ problemsSolved: -1, rating: -1 })
      .lean();

    // Add rank to each user
    const leaderboardWithRank = updatedLeaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    io.emit('leaderboardUpdate', leaderboardWithRank);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== PROBLEM MANAGEMENT ====================

// Get all problems
export const getAllProblems = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", difficulty = "", status = "", forContest } = req.query;
    
    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }

    if (forContest) {
      query.isPublished = false;
    }

    const problems = await Problem.find(query)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments(query);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get all problems error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new problem
export const createProblem = async (req, res) => {
  try {
    const {
      title,
      statement,
      input,
      output,
      constraints,
      tags,
      difficulty,
      timeLimit,
      memoryLimit,
      testCases,
      exampleTestCases
    } = req.body;

    const problem = new Problem({
      title,
      statement,
      input: input || '',
      output: output || '',
      constraints,
      tags: tags || [],
      difficulty: difficulty || 'Easy',
      timeLimit: timeLimit || 1000,
      memoryLimit: memoryLimit || 256,
      testCases: testCases || [],
      exampleTestCases: exampleTestCases || [],
      createdBy: req.user._id
    });

    await problem.save();

    res.status(201).json({ 
      message: "Problem created successfully", 
      problem 
    });
  } catch (error) {
    console.error("Create problem error:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Problem title already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

// Update problem
export const updateProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const updateData = req.body;

    const problem = await Problem.findByIdAndUpdate(
      problemId,
      updateData,
      { new: true }
    ).populate('createdBy', 'username email');

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json({ 
      message: "Problem updated successfully", 
      problem 
    });
  } catch (error) {
    console.error("Update problem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete problem
export const deleteProblem = async (req, res) => {
  try {
    const { problemId } = req.params;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    await Problem.findByIdAndDelete(problemId);
    
    // Also delete related submissions
    await Submission.deleteMany({ problem: problemId });

    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Delete problem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle problem publish status
export const toggleProblemPublish = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { isPublished } = req.body;

    const problem = await Problem.findByIdAndUpdate(
      problemId,
      { isPublished },
      { new: true }
    ).populate('createdBy', 'username email');

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json({ 
      message: `Problem ${isPublished ? 'published' : 'unpublished'} successfully`, 
      problem 
    });
  } catch (error) {
    console.error("Toggle problem publish error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== SUBMISSION MANAGEMENT ====================

// Get all submissions with filters
export const getAllSubmissions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      problem = "", 
      user = "", 
      language = "", 
      verdict = "" 
    } = req.query;
    
    const query = {};
    // User filter: allow username/email search
    if (user) {
      const userDocs = await User.find({
        $or: [
          { username: { $regex: user, $options: 'i' } },
          { email: { $regex: user, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = userDocs.map(u => u._id);
      if (userIds.length > 0) {
        query.user = { $in: userIds };
      } else {
        // No users match, return empty result
        return res.json({ submissions: [], totalPages: 0, currentPage: page, total: 0 });
      }
    }
    // Problem filter: allow title search
    if (problem) {
      const problemDocs = await Problem.find({
        title: { $regex: problem, $options: 'i' }
      }).select('_id');
      const problemIds = problemDocs.map(p => p._id);
      if (problemIds.length > 0) {
        query.problem = { $in: problemIds };
      } else {
        // No problems match, return empty result
        return res.json({ submissions: [], totalPages: 0, currentPage: page, total: 0 });
      }
    }
    if (language) {
      query.language = language;
    }
    if (verdict) {
      query.verdict = verdict;
    }
    const submissions = await Submission.find(query)
      .populate('user', 'username email')
      .populate('problem', 'title')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Submission.countDocuments(query);
    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get all submissions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get submission details
export const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('user', 'username email')
      .populate('problem', 'title statement constraints');

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ submission });
  } catch (error) {
    console.error("Get submission details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Re-judge submission
export const rejudgeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Reset submission status for re-judging
    submission.verdict = 'Pending';
    submission.judgedAt = null;
    submission.executionTime = null;
    submission.memoryUsed = null;
    submission.testCasesPassed = 0;
    submission.errorMessage = null;

    await submission.save();

    // Here you would typically trigger the judging system
    // For now, we'll just return success
    res.json({ 
      message: "Submission queued for re-judging", 
      submission 
    });
  } catch (error) {
    console.error("Re-judge submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete submission
export const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    await Submission.findByIdAndDelete(submissionId);

    // Recalculate problemsSolved for the user
    const userId = submission.user;
    const solved = await Submission.aggregate([
      { $match: { user: userId, verdict: 'AC' } },
      { $group: { _id: '$problem' } },
      { $count: 'solvedCount' }
    ]);
    const solvedCount = solved[0]?.solvedCount || 0;
    await User.findByIdAndUpdate(userId, { problemsSolved: solvedCount });

    // Emit leaderboard update
    const io = req.app.get('io');
    const updatedLeaderboard = await User.find()
      .select('username problemsSolved rating avatar createdAt')
      .sort({ problemsSolved: -1, rating: -1 })
      .lean();

    // Add rank to each user
    const leaderboardWithRank = updatedLeaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    io.emit('leaderboardUpdate', leaderboardWithRank);

    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== CONTEST MANAGEMENT ====================

// Get all contests
export const getAllContests = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;
    
    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (status === 'active') {
      query.isActive = true;
      query.startTime = { $lte: new Date() };
      query.endTime = { $gte: new Date() };
    } else if (status === 'upcoming') {
      query.startTime = { $gt: new Date() };
    } else if (status === 'ended') {
      query.endTime = { $lt: new Date() };
    }

    const contests = await Contest.find(query)
      .populate('createdBy', 'username email')
      .populate('problems', 'title difficulty')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contest.countDocuments(query);

    res.json({
      contests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get all contests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new contest
export const createContest = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      problems,
      isPublic,
      allowedUsers
    } = req.body;

    const contest = new Contest({
      title,
      description,
      startTime,
      endTime,
      problems: problems || [],
      createdBy: req.user._id,
      isPublic: isPublic || false,
      allowedUsers: isPublic ? [] : allowedUsers || []
    });

    await contest.save();

    res.status(201).json({ 
      message: "Contest created successfully", 
      contest 
    });
  } catch (error) {
    console.error("Create contest error:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Contest title already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

// Update contest
export const updateContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { isPublic, allowedUsers, ...updateData } = req.body;
    
    const finalUpdateData = { ...updateData };
    if (typeof isPublic === 'boolean') {
      finalUpdateData.isPublic = isPublic;
      // If contest is made public, clear the allowedUsers list
      if (isPublic) {
        finalUpdateData.allowedUsers = [];
      }
    }

    if (allowedUsers) {
      finalUpdateData.allowedUsers = allowedUsers;
    }

    // Save the new problems array
    const contest = await Contest.findByIdAndUpdate(
      contestId,
      finalUpdateData,
      { new: true }
    ).populate('createdBy', 'username email')
     .populate('problems', 'title difficulty');

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // --- Sync contest field in Problem documents ---
    if (finalUpdateData.problems) {
      // 1. Unset contest field for problems no longer in the contest
      await Problem.updateMany(
        { contest: contestId, _id: { $nin: finalUpdateData.problems } },
        { $set: { contest: null } }
      );
      // 2. Set contest field for all selected problems
      await Problem.updateMany(
        { _id: { $in: finalUpdateData.problems } },
        { $set: { contest: contestId } }
      );
    }
    // --- End sync ---

    res.json({ 
      message: "Contest updated successfully", 
      contest 
    });
  } catch (error) {
    console.error("Update contest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete contest
export const deleteContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    await Contest.findByIdAndDelete(contestId);

    res.json({ message: "Contest deleted successfully" });
  } catch (error) {
    console.error("Delete contest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== DASHBOARD STATISTICS ====================

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    // Only count submissions with a valid verdict
    const totalSubmissions = await Submission.countDocuments({ verdict: { $ne: null, $exists: true, $nin: [""] } });
    const totalContests = await Contest.countDocuments();

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email role createdAt');

    const recentSubmissions = await Submission.find()
      .populate('user', 'username')
      .populate('problem', 'title')
      .sort({ submittedAt: -1 })
      .limit(5);

    const verdictStats = await Submission.aggregate([
      { $match: { verdict: { $ne: null, $exists: true, $nin: [""] } } },
      {
        $group: {
          _id: '$verdict',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalContests
      },
      recentUsers,
      recentSubmissions,
      verdictStats
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Public stats for home page
export const getPublicStats = async (req, res) => {
  try {
    const totalProblems = await Problem.countDocuments({ isPublished: true });
    let totalSubmissions = 0;
    if (req.user && req.user.userId) {
      totalSubmissions = await Submission.countDocuments({ user: req.user.userId });
    }
    const totalUsers = await User.countDocuments();
    const now = new Date();
    const totalContests = await Contest.countDocuments({ endTime: { $gte: now } });
    res.json({
      totalProblems,
      totalSubmissions,
      totalUsers,
      totalContests
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update user details (username, email)
export const updateUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email } = req.body;
    // Check if username or email already exists (excluding current user)
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ email }, { username }] }
      ]
    });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "An account already exists with this email"
            : "Username is already taken",
      });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    ).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update user details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get number of unique problems solved by a user
export const getUserSolvedCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const solved = await Submission.aggregate([
      { $match: { user: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId, verdict: 'AC' } },
      { $group: { _id: '$problem' } },
      { $count: 'solvedCount' }
    ]);
    res.json({ solvedCount: solved[0]?.solvedCount || 0 });
  } catch (error) {
    console.error('Get user solved count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility: Sync contest field for all problems based on contests' problems arrays
export const syncContestProblems = async (req, res) => {
  try {
    const contests = await Contest.find({});
    let updated = 0;
    for (const contest of contests) {
      for (const problemId of contest.problems) {
        await Problem.updateOne(
          { _id: problemId },
          { $set: { contest: contest._id } }
        );
        updated++;
      }
    }
    res.json({ message: `Updated ${updated} problems with contest field.` });
  } catch (err) {
    console.error('Error syncing contest problems:', err);
    res.status(500).json({ message: 'Failed to sync contest problems.' });
  }
}; 