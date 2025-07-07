import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/generate-hint", async (req, res) => {
  const { problemStatement, userCode, language } = req.body;
  try {
    const prompt = `You are an expert programming assistant. A user is trying to solve the following programming problem (in ${language}):\n\n${problemStatement}\n\nHere is their current code:\n\n${userCode}\n\nGive a concise, actionable hint (1-3 sentences) that helps the user make progress, but does NOT reveal the full solution. Focus on the user's code and the problem. The hint should start on a new line after the heading 'Hint:' and use Markdown formatting with each sentence or point on a separate line for readability.\n\nHint:\n`;
    const response = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command",
        prompt: prompt,
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ hint: response.data.generations[0].text.trim() });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate hint" });
  }
});

router.post("/analyze-code", async (req, res) => {
  const { code, language, problemStatement } = req.body;
  try {
    const prompt = `You are an expert programming assistant. Analyze the following ${language} code written for this problem.\n\nProblem:\n${problemStatement}\n\nUser's Code:\n${code}\n\nGive concise, actionable feedback in no more than 5-10 lines. Do not provide detailed explanations—just the most important points, each as a single line. Use Markdown formatting and clearly number each point (1, 2, 3, ...). The feedback should start on a new line after the heading 'Feedback:'.\n\nFeedback:\n`;
    const response = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command",
        prompt,
        max_tokens: 400,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CODE_ANALYSIS_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ feedback: response.data.generations[0].text.trim() });
  } catch (error) {
    console.error("Cohere error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to analyze code" });
  }
});

router.post("/explain-problem", async (req, res) => {
  const { problemStatement, language } = req.body;
  try {
    const prompt = `You are an expert programming assistant. Your job is to restate the following programming problem in a much simpler, beginner-friendly way. Do NOT give any hints, solution ideas, or advice. Just explain what the problem is about and what the user is supposed to do, in clear, concise language (5-10 lines max). Use Markdown formatting and start the explanation on a new line after the heading 'Explanation:'.

Problem:\n${problemStatement}\n\nExplanation:\n`;
    const response = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command",
        prompt: prompt,
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PROBLEM_EXPLAIN_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ explanation: response.data.generations[0].text.trim() });
  } catch (error) {
    res.status(500).json({ error: "Failed to explain problem" });
  }
});

router.post("/generate-boilerplate", async (req, res) => {
  const { problemStatement, language } = req.body;
  try {
    const messages = [
      {
        role: "system",
        content: `You are an expert ${language} programmer. Given the following problem, generate only the minimal, idiomatic starter code (boilerplate) for a solution in ${language}. Do NOT solve the problem, do NOT include any comments or explanations. Only output the code, nothing else.`
      },
      {
        role: "user",
        content: `Problem:\n${problemStatement}`
      }
    ];
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: messages,
        max_tokens: 500,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BOILERPLATE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const raw = response.data.choices?.[0]?.message?.content?.trim() || "";
    // Extract code inside the first code block if present
    let code = raw;
    const codeBlockMatch = raw.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      code = codeBlockMatch[1].trim();
    }
    res.json({ boilerplate: code });
  } catch (error) {
    console.error("Boilerplate generation error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to generate boilerplate code" });
  }
});

router.post("/debug-code", async (req, res) => {
  const { code, language, problemStatement } = req.body;
  try {
    const messages = [
      {
        role: "system",
        content: `You are an expert ${language} programmer and code reviewer. Given the following problem and code, perform a thorough debugging review. For each of the following categories, identify, explain concisely (1-2 lines per issue), and suggest a brief fix for any issues found: 1) Syntax Errors, 2) Runtime Errors, 3) Logical Errors, 4) Performance Bottlenecks, 5) Semantic or Design Issues. Do NOT write, output, or suggest any code or code snippets. Only list and explain the issues, referencing line numbers or variable names if needed. Your job is only to point out and explain errors, not to write or rewrite any code. Use Markdown formatting and number each point. Do NOT provide a full solution or lengthy explanations.\n\nProblem:\n${problemStatement}`
      },
      {
        role: "user",
        content: `User's code:\n${code}`
      }
    ];
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: messages,
        max_tokens: 300,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEBUG_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const debug = response.data.choices?.[0]?.message?.content?.trim() || "";
    res.json({ debug });
  } catch (error) {
    console.error("Debug code error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to debug code" });
  }
});

export default router; 