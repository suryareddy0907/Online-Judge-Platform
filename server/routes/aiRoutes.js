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
  const { problemStatement, language, currentBoilerplate } = req.body;
  try {
    let messages;
    if (currentBoilerplate && currentBoilerplate.trim().length > 0) {
      messages = [
        {
          role: "system",
          content: `You are an expert ${language} programmer. Continue generating only the minimal code skeleton (template) for a solution in ${language} to the following problem. The skeleton must be structured in this order: (1) all necessary headers, (2) any required namespaces (e.g., 'using namespace std;' in C++), (3) all helper function or class definitions with empty bodies (no logic) immediately below the headers and namespaces, and (4) a complete main function with only input/output structure and function calls, but no implementation logic. Do NOT include any helper function declarations (prototypes), comments, explanations, or TODOs. Only output the next part of the code skeleton, nothing else. The code must be a modifiable template for the user. Do NOT repeat any code already provided. If the skeleton is already complete, reply with 'COMPLETE'.`
        },
        {
          role: "user",
          content: `Problem:\n${problemStatement}\n\nCurrent code:\n${currentBoilerplate}`
        }
      ];
    } else {
      messages = [
        {
          role: "system",
          content: `You are an expert ${language} programmer. Given the following problem, generate only the minimal code skeleton (template) for a solution in ${language}. The skeleton must be structured in this order: (1) all necessary headers, (2) any required namespaces (e.g., 'using namespace std;' in C++), (3) all helper function or class definitions with empty bodies (no logic) immediately below the headers and namespaces, and (4) a complete main function with only input/output structure and function calls, but no implementation logic. Do NOT include any helper function declarations (prototypes), comments, explanations, or TODOs. Only output the code skeleton, nothing else. The code must be a modifiable template for the user.`
        },
        {
          role: "user",
          content: `Problem:\n${problemStatement}`
        }
      ];
    }
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
          Authorization: `Bearer ${process.env.BOILERPLATE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const raw = response.data.choices?.[0]?.message?.content?.trim() || "";
    let code = raw;
    code = code.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, '$1').replace(/```/g, '');
    code = code.replace(/^[^#\n{\[]*[\n]+/, '');
    code = code.split('\n').filter(line => !/todo/i.test(line)).join('\n');
    code = code.trim();
    res.json({ boilerplate: code });
  } catch (error) {
    console.error("Boilerplate generation error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to generate boilerplate code" });
  }
});

router.post("/debug-code", async (req, res) => {
  const { code, language, problemStatement } = req.body;
  try {
    const prompt = `You are an expert ${language} programmer and code reviewer. Given the following problem and code, perform a thorough debugging review. For each of the following categories, identify, explain concisely (1-2 lines per issue), and suggest a brief fix for any issues found: 1) Syntax Errors, 2) Runtime Errors, 3) Logical Errors, 4) Performance Bottlenecks, 5) Semantic or Design Issues. Do NOT write, output, or suggest any code or code snippets. Only list and explain the issues, referencing line numbers or variable names if needed. Your job is only to point out and explain errors, not to write or rewrite any code. Use Markdown formatting and number each point. Do NOT provide a full solution or lengthy explanations.\n\nProblem:\n${problemStatement}\n\nUser's code:\n${code}`;
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

export default router; 