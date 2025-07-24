import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import axios from "axios";
import { getContestLeaderboard } from './leaderboardController.js';

const COMPILER_SERVICE_URL = process.env.COMPILER_SERVICE_URL;

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
      if (Array.isArray(tag)) {
        query.tags = { $in: tag };
      } else if (typeof tag === 'string' && tag.includes(',')) {
        query.tags = { $in: tag.split(',') };
      } else {
        query.tags = tag;
      }
    }
    const problems = await Problem.find(query).sort({ createdAt: -1 });
    res.json({ problems });
  } catch (err) {
    console.error("Get public problems error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitProblem = async (req, res) => {
  console.log("submitProblem called, req is:", typeof req, req && typeof req.app, req && req.app && typeof req.app.get);
  const { id: problemId } = req.params;
  const { language, code } = req.body;
  const userId = req.user.userId;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    if (!problem.testCases || problem.testCases.length === 0) {
      return res.status(400).json({ message: "Problem has no hidden test cases" });
    }

    // If code is empty or only whitespace, treat as WA
    if (!code || code.trim().length === 0) {
      try {
        await Submission.create({
          user: userId,
          problem: problemId,
          code,
          language,
          totalTestCases: problem.testCases.length,
          verdict: "WA",
          errorMessage: "Wrong Answer: No code submitted",
          judgedAt: new Date(),
        });
      } catch (err) {
        // If Submission.create fails (e.g., code required), still return WA
      }
      return res.status(200).json({ verdict: "WA", message: "Wrong Answer: No code submitted" });
    }

    const newSubmission = await Submission.create({
      user: userId,
      problem: problemId,
      code,
      language,
      totalTestCases: problem.testCases.length,
    });

    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      const runPayload = {
        language: language,
        code,
        input: testCase.input,
      };

      try {
        const { data } = await axios.post(`${COMPILER_SERVICE_URL}/run`, runPayload);

        // If compiler service says no code provided, treat as WA
        if (data.output && data.output === "No code provided") {
          await Submission.findByIdAndUpdate(newSubmission._id, { verdict: "WA", judgedAt: new Date(), errorMessage: "Wrong Answer: No code submitted" });
          return res.status(200).json({ verdict: "WA", message: "Wrong Answer: No code submitted" });
        }

        if (data.error || (data.output && data.output.error)) {
           let verdict, errorMessage;
           const errorDetails = data.output ? data.output : data;
           const errorMsg = (errorDetails.error || errorDetails.stderr || errorDetails.output || '').toString().toLowerCase();
           if (errorDetails.error && errorDetails.error.includes("Compilation failed")) {
             verdict = "CE";
             errorMessage = `Compilation Error: ${errorDetails.stderr || errorDetails.error}`;
           } else if (errorDetails.error && errorDetails.error.includes("Time Limit Exceeded")) {
             verdict = "TLE";
             errorMessage = `Time Limit Exceeded on Test Case ${i + 1}`;
           } else if (
             (errorDetails.error && errorDetails.error.toLowerCase().includes("memory limit exceeded")) ||
             (errorDetails.stderr && errorDetails.stderr.toLowerCase().includes("memory limit exceeded")) ||
             (errorDetails.output && errorDetails.output.toLowerCase().includes("memory limit exceeded")) ||
             (data.output && data.output.toLowerCase().includes('memory limit exceeded'))
           ) {
             verdict = "MLE";
             errorMessage = 'MLE: Memory Limit Exceeded';
           } else {
             verdict = "RE";
             errorMessage = `Runtime Error on Test Case ${i + 1}: ${errorDetails.stderr || errorDetails.error}`;
           }
           await Submission.findByIdAndUpdate(newSubmission._id, { verdict, judgedAt: new Date(), errorMessage });
           return res.status(200).json({ verdict, message: errorMessage });
        }
        
        const trimmedOutput = (data.output || "").toString().trim();
        const trimmedExpectedOutput = (testCase.output || "").toString().trim();

        // Remove logic that treats empty output as MLE
        if (
          trimmedOutput.toLowerCase().includes('memory limit exceeded') ||
          (data.error && data.error.toLowerCase().includes('memory limit exceeded'))
        ) {
          await Submission.findByIdAndUpdate(newSubmission._id, { verdict: "MLE", judgedAt: new Date(), errorMessage: 'MLE: Memory Limit Exceeded' });
          return res.status(200).json({ verdict: "MLE", message: 'MLE: Memory Limit Exceeded' });
        }
        // If output does not match expected, always WA (after MLE/TLE/RE/CE checks)
        if (trimmedOutput !== trimmedExpectedOutput) {
          await Submission.findByIdAndUpdate(newSubmission._id, { verdict: "WA", judgedAt: new Date(), errorMessage: `Wrong Answer on Test Case ${i + 1}` });
          return res.status(200).json({ verdict: "WA", message: `Wrong Answer on Test Case ${i + 1}` });
        }

        await Submission.findByIdAndUpdate(newSubmission._id, { $inc: { testCasesPassed: 1 } });
      } catch (error) {
        // Log the error for debugging
        console.error("Error during code execution:", error);

        let verdict = "RE";
        let errorMessage = `Error judging Test Case ${i + 1}: ${error.message || error}`;

        // Safely check for compilation error
        const errorText = (typeof error === "string")
          ? error
          : (error?.error || error?.stderr || error?.message || JSON.stringify(error));

        if (errorText && errorText.includes("Compilation failed")) {
          verdict = "CE";
          errorMessage = `Compilation Error: ${error.stderr || error.error || errorText}`;
        }
        if (errorText && errorText.toLowerCase().includes("memory limit exceeded")) {
          verdict = "MLE";
          errorMessage = 'MLE: Memory Limit Exceeded';
        }

        await Submission.findByIdAndUpdate(newSubmission._id, { verdict, judgedAt: new Date(), errorMessage });
        return res.status(200).json({ verdict, message: errorMessage });
      }
    }

    // Check before creating new AC
    const alreadySolved = await Submission.findOne({
      user: userId,
      problem: problemId,
      verdict: "AC"
    });

    await Submission.findByIdAndUpdate(newSubmission._id, {
      verdict: "AC",
      judgedAt: new Date()
    });

    if (!alreadySolved) {
      // Increment user's solved count
      await User.findByIdAndUpdate(userId, {
        $inc: { problemsSolved: 1 }
      });

      // Emit leaderboard update with proper format
      const io = req.app.get("io");
      console.log('Emitting leaderboardUpdate event...');
      
      try {
        // Get updated leaderboard data
        const users = await User.find({ 
          isActive: true, 
          isBanned: false 
        })
        .select("username problemsSolved rating avatar createdAt")
        .sort({ problemsSolved: -1, rating: -1 })
        .limit(10)
        .lean();

        // Add rank to each user
        const leaderboardWithRank = users.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

        console.log('Emitting leaderboardUpdate with data:', leaderboardWithRank);
        io.emit("leaderboardUpdate", leaderboardWithRank);
      } catch (error) {
        console.error('Error updating general leaderboard:', error);
      }

      // Emit contest leaderboard update if this is a contest problem
      if (problem.contest) {
        console.log('Problem is part of contest:', problem.contest, '- emitting contestLeaderboardUpdate');
        try {
          // Get contest leaderboard data directly
          const problems = await Problem.find({ contest: problem.contest }).select('_id');
          const problemIds = problems.map(p => p._id);
          
          if (problemIds.length > 0) {
            const acSubmissions = await Submission.find({
              problem: { $in: problemIds },
              verdict: 'AC'
            }).populate('user', 'username avatar').sort({ submittedAt: 1 }).lean();
            
            // Map userId to set of solved problemIds and earliest AC time
            const userSolvedMap = {};
            for (const sub of acSubmissions) {
              const uid = String(sub.user._id);
              if (!userSolvedMap[uid]) {
                userSolvedMap[uid] = { problems: new Set(), firstAC: sub.submittedAt, user: sub.user };
              }
              userSolvedMap[uid].problems.add(String(sub.problem));
              if (sub.submittedAt < userSolvedMap[uid].firstAC) {
                userSolvedMap[uid].firstAC = sub.submittedAt;
              }
            }
            
            // Prepare leaderboard array
            let leaderboard = Object.values(userSolvedMap).map(u => ({
              username: u.user.username,
              avatar: u.user.avatar,
              problemsSolved: u.problems.size,
              firstAC: u.firstAC,
              problems: Array.from(u.problems)
            }));
            
            // Sort by problemsSolved desc, then by firstAC asc
            leaderboard.sort((a, b) => {
              if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
              return new Date(a.firstAC) - new Date(b.firstAC);
            });
            
            // Add rank
            leaderboard = leaderboard.map((u, i) => ({ ...u, rank: i + 1 }));
            
            console.log('Emitting contestLeaderboardUpdate with data:', { contestId: String(problem.contest), leaderboard });
            io.emit("contestLeaderboardUpdate", { contestId: String(problem.contest), leaderboard });
          }
        } catch (error) {
          console.error('Error updating contest leaderboard:', error);
        }
      }
    }

    return res.status(200).json({ verdict: "AC", message: "Accepted" });

  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ message: "Internal server error during submission." });
  }
};

// Get all submissions for the current user
export const getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { problem = '', language = '', verdict = '', page = 1, limit = 10 } = req.query;
    const query = { user: userId };
    if (problem) {
      // Search for problems with matching title
      const problemDocs = await Problem.find({ title: { $regex: problem, $options: 'i' } }).select('_id');
      const problemIds = problemDocs.map(p => p._id);
      if (problemIds.length > 0) {
        query.problem = { $in: problemIds };
      } else {
        return res.json({ submissions: [], totalPages: 0, currentPage: page, total: 0 });
      }
    }
    if (language) query.language = language;
    if (verdict) query.verdict = verdict;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const submissions = await Submission.find(query)
      .populate('problem', 'title')
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    const total = await Submission.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));
    res.json({ submissions, totalPages, currentPage: parseInt(page), total });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all submissions for the current user for a specific problem
export const getMySubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { problemId } = req.params;
    const { language = '', verdict = '', page = 1, limit = 10 } = req.query;
    const query = { user: userId, problem: problemId };
    if (language) query.language = language;
    if (verdict) query.verdict = verdict;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const submissions = await Submission.find(query)
      .populate('problem', 'title')
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    const total = await Submission.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));
    res.json({ submissions, totalPages, currentPage: parseInt(page), total });
  } catch (error) {
    console.error('Get my submissions for problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/problems/:id - get problem by ID (including draft) for authenticated users
export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json({ problem });
  } catch (err) {
    console.error('Get problem by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 