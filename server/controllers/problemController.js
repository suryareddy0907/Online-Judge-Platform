import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import axios from "axios";

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

export const submitProblem = async (req, res) => {
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

    const newSubmission = await Submission.create({
      user: userId,
      problem: problemId,
      code,
      language,
      totalTestCases: problem.testCases.length,
    });

    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      // Map language to the correct value for the compiler microservice
      let runLanguage = language;
      if (language === 'python') runLanguage = 'py';
      if (language === 'cpp') runLanguage = 'cpp';
      if (language === 'c') runLanguage = 'c';
      if (language === 'java') runLanguage = 'java';
      const runPayload = {
        language: runLanguage,
        code,
        input: testCase.input,
      };

      try {
        const { data } = await axios.post("http://localhost:5001/run", runPayload);

        if (data.error || (data.output && data.output.error)) {
           let verdict, errorMessage;
           const errorDetails = data.output ? data.output : data;
           if (errorDetails.error.includes("Time Limit Exceeded")) {
             verdict = "TLE";
             errorMessage = `Time Limit Exceeded on Test Case ${i + 1}`;
           } else {
             verdict = "RE";
             errorMessage = `Runtime Error on Test Case ${i + 1}`;
           }
           await Submission.findByIdAndUpdate(newSubmission._id, { verdict, judgedAt: new Date(), errorMessage });
           return res.status(200).json({ verdict, message: errorMessage });
        }
        
        const trimmedOutput = (data.output || "").toString().trim();
        const trimmedExpectedOutput = (testCase.output || "").toString().trim();

        if (trimmedOutput !== trimmedExpectedOutput) {
          await Submission.findByIdAndUpdate(newSubmission._id, { verdict: "WA", judgedAt: new Date(), errorMessage: `Wrong Answer on Test Case ${i + 1}` });
          return res.status(200).json({ verdict: "WA", message: `Wrong Answer on Test Case ${i + 1}` });
        }

        await Submission.findByIdAndUpdate(newSubmission._id, { $inc: { testCasesPassed: 1 } });
      } catch (error) {
        await Submission.findByIdAndUpdate(newSubmission._id, { verdict: "RE", judgedAt: new Date(), errorMessage: `Error judging Test Case ${i + 1}: ${error.message}` });
        return res.status(500).json({ verdict: "RE", message: `An error occurred during judging: ${error.message}` });
      }
    }

    await Submission.findByIdAndUpdate(newSubmission._id, { verdict: "AC", judgedAt: new Date() });
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
    const { problem = '', language = '', verdict = '' } = req.query;
    const query = { user: userId };
    if (problem) {
      // Search for problems with matching title
      const problemDocs = await Problem.find({ title: { $regex: problem, $options: 'i' } }).select('_id');
      const problemIds = problemDocs.map(p => p._id);
      if (problemIds.length > 0) {
        query.problem = { $in: problemIds };
      } else {
        return res.json({ submissions: [] });
      }
    }
    if (language) query.language = language;
    if (verdict) query.verdict = verdict;
    const submissions = await Submission.find(query)
      .populate('problem', 'title')
      .sort({ submittedAt: -1 });
    res.json({ submissions });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 