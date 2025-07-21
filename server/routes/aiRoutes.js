import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/generate-hint", async (req, res) => {
  const { problemStatement, userCode, language } = req.body;
  try {
    const prompt = `You are an expert programming assistant. A user is trying to solve the following programming problem (in ${language}):\n\n${problemStatement}\n\nHere is their current code:\n\n${userCode}\n\nGive a concise, actionable hint (1-3 sentences or points) that helps the user make progress, but does NOT reveal the full solution. Focus on the user's code and the problem. Number each point (1., 2., ...) and start each on a new line after the heading 'Hint:'. Use Markdown formatting for readability.\n\nHint:\n`;
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
  if (!code || code.trim().length === 0) {
    return res.status(400).json({ feedback: "The code is empty. Please write the code." });
  }
  try {
    const prompt = `You are an expert programming assistant. Analyze the following ${language} code written for this problem.\n\nProblem:\n${problemStatement}\n\nUser's Code:\n${code}\n\nGive concise, actionable feedback in no more than 5-10 lines. Do NOT provide any code snippets, code examples, or code blocks. Do not provide detailed explanations—just the most important points, each as a single line. Use Markdown formatting and clearly number each point (1, 2, 3, ...). The feedback should start on a new line after the heading 'Feedback:'.\n\nFeedback:\n`;
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
    const prompt = `You are an expert programming assistant. Your job is to restate ONLY the description of the following programming problem in a much simpler, beginner-friendly way. Do NOT give any hints, solution ideas, logic, or advice. Do NOT mention how to solve the problem or any steps to approach it. Just explain what the problem is about and what the user is supposed to do, in clear, concise language (5-10 lines max). Use Markdown formatting and start the explanation on a new line after the heading 'Explanation:'.\n\nProblem:\n${problemStatement}\n\nExplanation:\n`;
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

router.post("/debug-code", async (req, res) => {
  const { code, language, problemStatement } = req.body;
  try {
    const prompt = `You are a code debugging assistant. Analyze the user's code based on the problem statement and list any errors.

**IMPORTANT RULES:**
1.  Your entire response **MUST** be 5-10 lines total.
2.  **ONLY** list the errors. If there are no errors in a category (like Syntax), **DO NOT MENTION IT**.
3.  **NO MARKDOWN**. Do not use \`###\`, \`*\`, \`**\`, or backticks.
4.  Use a simple numbered list for the errors you find.
5.  Explain issues in plain, simple English.

**Problem:**
${problemStatement}

**User's code:**
${code}`;
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.DEBUG_KEY,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const debug = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    res.json({ debug });
  } catch (error) {
    console.error("Debug code error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to debug code" });
  }
});

router.post("/complexity", async (req, res) => {
  const { code, language, problemStatement } = req.body;
  try {
    const prompt = `You are an expert programming assistant. Analyze the following ${language} code for this problem:

Problem:
${problemStatement}

User's Code:
${code}

Give a concise summary (5-10 lines) of the code's time and space complexity. Only mention the main functions/loops/algorithms. Do NOT use markdown, code blocks, or symbols like *, #, or backticks. Use plain English and simple numbered points. If the code is incomplete, state what is missing for a full analysis.`;
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BOILERPLATE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const complexity = response.data.choices?.[0]?.message?.content?.trim() || "";
    res.json({ complexity });
  } catch (error) {
    console.error("Complexity analysis error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to analyze complexity" });
  }
});

export default router; 