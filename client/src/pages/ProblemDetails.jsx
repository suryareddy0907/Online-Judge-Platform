import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getProblemById } from "../services/authService";
import axios from "axios";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import MonacoEditor from "@monaco-editor/react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Returns boilerplate code for the given language
function getBoilerplate(lang) {
  switch (lang) {
    case 'cpp':
      return `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}`;
    case 'c':
      return `#include <stdio.h>\n\nint main() {\n    // your code goes here\n    return 0;\n}`;
    case 'java':
      return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // your code goes here\n    }\n}`;
    case 'python':
      return `# your code goes here\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()`;
    default:
      return '';
  }
}

const ProblemDetails = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [language, setLanguage] = useState("cpp"); // Default language is C++
  const [isLoading, setIsLoading] = useState(false);
  const allotmentRef = useRef(null);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(""); // "hint" | "analyze" | "boilerplate" | "explain" | ""
  const [codeFeedback, setCodeFeedback] = useState("");
  const [explanation, setExplanation] = useState("");
  const [debugOutput, setDebugOutput] = useState("");
  const lastAnalyzedCodeRef = useRef("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showHint, setShowHint] = useState(true);
  const [showCodeFeedback, setShowCodeFeedback] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const [showDebugOutput, setShowDebugOutput] = useState(true);
  const [showResizeHint, setShowResizeHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResizeHint(false);
    }, 5000); // Hide after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProblemById(id);
        setProblem(data.problem);
      } catch (err) {
        setError("Failed to load problem");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  // Set boilerplate on problem load and language change, unless user has started editing
  useEffect(() => {
    if (problem) {
      setCode(getBoilerplate(language));
    }
  }, [problem, language]);

  useEffect(() => {
    if (output && allotmentRef.current) {
      allotmentRef.current.resize([100, 400]);
    }
  }, [output]);

  useEffect(() => {
    // Inject classic white spinner CSS globally
    const style = document.createElement('style');
    style.innerHTML = `
      .neon-spinner {
        display: inline-block;
        width: 32px;
        height: 32px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top: 4px solid #fff;
        border-radius: 50%;
        animation: neon-spin 0.7s linear infinite;
        box-shadow: 0 0 8px #fff, 0 0 16px #fff;
      }
      @keyframes neon-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleRun = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/run`, {
        code: code,
        language: language,
        input: customInput,
      });
      if (
        response.data.output &&
        (response.data.output.includes("Compilation failed") || response.data.output.includes("Compilation Error"))
      ) {
        const compilerOutput = response.data.stderr || response.data.output;
        setOutput({ type: 'CE', message: compilerOutput });
      } else if (
        response.data.output === 'MLE: Memory Limit Exceeded'
      ) {
        setOutput({ type: 'MLE', message: 'Memory limit exceeded' });
      } else if (
        response.data.error === 'Time Limit Exceeded' ||
        (response.data.output && response.data.output.includes('Process terminated after 2 seconds'))
      ) {
        setOutput({ type: 'TLE', message: 'Time limit exceeded' });
      } else if (
        response.data.output &&
        (response.data.output.toLowerCase().includes("runtime error") || response.data.output.toLowerCase().includes("re:"))
      ) {
        setOutput({ type: 'RE', message: 'Runtime error' });
      } else {
        setOutput(response.data.output);
      }
    } catch (err) {
      const errMsg = err.response?.data?.stderr || err.response?.data?.output || err.response?.data?.error || err.message || "An unexpected error occurred.";
      if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('memory limit exceeded')) {
        setOutput({ type: 'MLE', message: 'Memory limit exceeded' });
      } else if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('time limit exceeded')) {
        setOutput({ type: 'TLE', message: 'Time limit exceeded' });
      } else if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('runtime error')) {
        setOutput({ type: 'RE', message: 'Runtime error' });
      } else {
        setOutput(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setOutput("Submitting your solution...");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/problems/${id}/submit`,
        { code, language },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // If verdict is CE, show CE: Compilation error and actual error below
      if (response.data.verdict === 'CE') {
        // Remove any leading 'Compilation Error' or similar prefix from the message
        let cleanMsg = response.data.message;
        if (typeof cleanMsg === 'string') {
          cleanMsg = cleanMsg.replace(/^(Compilation (Error|error|failed):?\s*)/i, '');
        }
        setOutput({ type: 'CE', message: cleanMsg.trim() });
      } else if (
        response.data.verdict === 'MLE' ||
        (typeof response.data.message === 'string' && response.data.message.toLowerCase().includes('memory limit exceeded'))
      ) {
        setOutput('MLE: Memory Limit Exceeded');
      } else {
        setOutput(`${response.data.verdict}: ${response.data.message}`);
      }
    } catch (err) {
      setOutput(
        `Submission failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateHint = async () => {
    if (hint) {
      setPopupMessage("The Hints are generated already.");
      setShowPopup(true);
      return;
    }
    setAiLoading("hint");
    setHint("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/generate-hint`, {
        problemStatement: problem.statement,
        userCode: code,
        language: language,
      });
      setHint(response.data.hint);
    } catch (err) {
      setHint("Failed to generate hint.");
    } finally {
      setAiLoading("");
    }
  };

  const handleAnalyzeCode = async () => {
    if (!code || code.trim().length === 0) {
      setCodeFeedback("The code is empty. Please write the code.");
      return;
    }
    if (lastAnalyzedCodeRef.current === code) {
      setCodeFeedback("You have already analyzed this code. Please modify your code to analyze again.");
      return;
    }
    setAiLoading("analyze");
    setCodeFeedback("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/analyze-code`, {
        code,
        language,
        problemStatement: problem.statement,
      });
      setCodeFeedback(response.data.feedback);
      lastAnalyzedCodeRef.current = code;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.feedback) {
        setCodeFeedback(err.response.data.feedback);
      } else {
        setCodeFeedback("Failed to analyze code.");
      }
    } finally {
      setAiLoading("");
    }
  };

  const handleExplainProblem = async () => {
    if (explanation) {
      setPopupMessage("The Explanation is generated already.");
      setShowPopup(true);
      return;
    }
    setAiLoading("explain");
    setExplanation("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/explain-problem`, {
        problemStatement: problem.statement,
        language: language,
      });
      setExplanation(response.data.explanation);
    } catch (err) {
      setExplanation("Failed to explain problem.");
    } finally {
      setAiLoading("");
    }
  };

  const handleDebugCode = async () => {
    setAiLoading("debug");
    setDebugOutput("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/debug-code`, {
        code,
        language,
        problemStatement: problem.statement,
      });
      setDebugOutput(response.data.debug);
    } catch (err) {
      setDebugOutput("Failed to debug code.");
    } finally {
      setAiLoading("");
    }
  };

  // Optional: Clean up file paths, keep alignment
  const formatOutputMessage = (msg) => {
    if (typeof msg !== 'string') return String(msg);
    return msg
      .split('\n')
      .map(line => {
        if (
          line.includes('/codes/') ||
          line.includes('outputs/') ||
          line.includes('\\') || // Windows paths
          line.includes('.cpp: note:')
        ) return null; // skip line
        return line; // preserve indentation
      })
      .filter(Boolean)
      .join('\n');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#181c24] text-[#00ff99] font-mono animate-pulse">Loading...</div>;
  if (error || !problem) return <div className="min-h-screen flex items-center justify-center text-red-500 bg-[#181c24] font-mono">{error || "Problem not found"}</div>;

  return (
    <>
      <div className="h-screen bg-[#181c24] font-mono text-white">
        <Allotment>
          <Allotment.Pane>
            {/* Left: Problem Details */}
            <div className="p-8 border-r-2 border-[#00cfff] overflow-y-auto h-full modal-scrollbar bg-[#181c24]" style={{ fontFamily: 'Fira Mono, monospace' }}>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-6 tracking-tight drop-shadow-lg">{problem.title}</h1>
              {/* AI Feature Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  className="bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-bold py-2 px-4 rounded-lg shadow hover:from-[#00cfff] hover:to-[#00ff99] transition-all flex items-center border-2 border-[#00ff99]"
                  onClick={handleGenerateHint}
                  disabled={aiLoading !== ""}
                >
                  {aiLoading === "hint" ? (
                    <span className="inline-flex items-center justify-center mr-2">
                      <span className="spinner-circle"></span>
                    </span>
                  ) : null}
                  {aiLoading === "hint" ? "Generating..." : "Generate Hints"}
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition flex items-center"
                  onClick={handleAnalyzeCode}
                  disabled={aiLoading !== ""}
                >
                  {aiLoading === "analyze" ? (
                    <span className="inline-flex items-center justify-center mr-2">
                      <span className="spinner-circle"></span>
                    </span>
                  ) : null}
                  {aiLoading === "analyze" ? "Analyzing..." : "Analyze Code"}
                </button>
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition flex items-center"
                  onClick={() => setCode(getBoilerplate(language))}
                  disabled={aiLoading !== ""}
                >
                  {aiLoading === "boilerplate" ? (
                    <span className="inline-flex items-center justify-center mr-2">
                      <span className="spinner-circle"></span>
                    </span>
                  ) : null}
                  {aiLoading === "boilerplate" ? "Generating..." : "Generate Boilerplate"}
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition flex items-center"
                  onClick={handleExplainProblem}
                  disabled={aiLoading !== ""}
                >
                  {aiLoading === "explain" ? (
                    <span className="inline-flex items-center justify-center mr-2">
                      <span className="spinner-circle"></span>
                    </span>
                  ) : null}
                  {aiLoading === "explain" ? "Generating..." : "Explain Problem"}
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition flex items-center"
                  onClick={handleDebugCode}
                  disabled={aiLoading !== ""}
                >
                  {aiLoading === "debug" ? (
                    <span className="inline-flex items-center justify-center mr-2">
                      <span className="spinner-circle"></span>
                    </span>
                  ) : null}
                  {aiLoading === "debug" ? "Debugging..." : "Debug Code"}
                </button>
              </div>
              {hint && showHint && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 relative">
                  <strong>Hint:</strong> <span style={{ whiteSpace: 'pre-line' }}>{hint.replace(/^\s*Hint:\s*/i, '').replace(/(\d+\.)/g, '\n$1').replace(/^\n/, '')}</span>
                  <button
                    className="absolute top-2 right-2 text-blue-400 hover:text-blue-700 text-lg font-bold"
                    onClick={() => setShowHint(false)}
                    aria-label="Close Hint"
                  >
                    &times;
                  </button>
                </div>
              )}
              {codeFeedback && showCodeFeedback && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-900 relative">
                  <strong>Code Feedback:</strong> <span style={{ whiteSpace: 'pre-line' }}>{codeFeedback.replace(/(\d+\.)/g, '\n$1').replace(/^\n/, '')}</span>
                  <button
                    className="absolute top-2 right-2 text-green-400 hover:text-green-700 text-lg font-bold"
                    onClick={() => setShowCodeFeedback(false)}
                    aria-label="Close Code Feedback"
                  >
                    &times;
                  </button>
                </div>
              )}
              {explanation && showExplanation && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-900 relative">
                  <strong>Explanation:</strong> <span dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>') }} />
                  <button
                    className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-700 text-lg font-bold"
                    onClick={() => setShowExplanation(false)}
                    aria-label="Close Explanation"
                  >
                    &times;
                  </button>
                </div>
              )}
              {debugOutput && showDebugOutput && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-900 relative">
                  <strong>Debug Output:</strong> <span dangerouslySetInnerHTML={{ __html: debugOutput.replace(/\n/g, '<br/>') }} />
                  <button
                    className="absolute top-2 right-2 text-red-400 hover:text-red-700 text-lg font-bold"
                    onClick={() => setShowDebugOutput(false)}
                    aria-label="Close Debug Output"
                  >
                    &times;
                  </button>
                </div>
              )}
              {/* Problem Statement */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-[#00cfff]">Description</h2>
                <p className="text-[#baffea] text-base leading-relaxed mb-4" style={{ fontSize: '1.08rem' }}>{problem.statement}</p>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-[#00cfff]">Constraints</h2>
                <p className="text-[#e0e0e0] text-base leading-relaxed mb-4" style={{ fontSize: '1.08rem' }}>{problem.constraints}</p>
              </div>
              {problem.input && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 text-[#00cfff]">Input</h2>
                  <p className="text-[#baffea] text-base leading-relaxed mb-4" style={{ fontSize: '1.08rem' }}>{problem.input}</p>
                </div>
              )}
              {problem.output && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 text-[#00cfff]">Output</h2>
                  <p className="text-[#baffea] text-base leading-relaxed mb-4" style={{ fontSize: '1.08rem' }}>{problem.output}</p>
                </div>
              )}
              <div className="mb-8">
                <h2 className="text-lg font-extrabold mb-3 bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text tracking-tight">Example Test Cases</h2>
                {problem.exampleTestCases && problem.exampleTestCases.length > 0 ? (
                  <div className="space-y-4">
                    {problem.exampleTestCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl p-4 modal-scrollbar overflow-x-auto shadow-lg"
                        style={{ fontFamily: 'Fira Mono, monospace' }}
                      >
                        <div className="text-sm text-[#00ff99] font-bold mb-2">Example {idx + 1}</div>
                        <div className="mb-2">
                          <span className="font-bold text-[#00cfff]">Input:</span>
                          <pre className="text-[#baffea] text-base leading-relaxed bg-transparent mt-1 mb-2 whitespace-pre-wrap">{tc.input}</pre>
                        </div>
                        <div className="mb-2">
                          <span className="font-bold text-[#00cfff]">Output:</span>
                          <pre className="text-[#baffea] text-base leading-relaxed bg-transparent mt-1 mb-2 whitespace-pre-wrap">{tc.output}</pre>
                        </div>
                        {tc.explanation && (
                          <div className="mt-2">
                            <span className="font-bold text-[#00cfff]">Explanation:</span>
                            <pre className="text-[#e0e0e0] text-base leading-relaxed bg-transparent mt-1 whitespace-pre-wrap">{tc.explanation}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[#baffea]">No example test cases.</div>
                )}
              </div>
            </div>
          </Allotment.Pane>
          <Allotment.Pane>
            <Allotment vertical ref={allotmentRef}>
              <Allotment.Pane>
                {/* Right-Top: Code Editor */}
                <div className="h-full flex flex-col bg-[#18181b] p-8">
                  {/* Language Dropdown */}
                  <div className="mb-4">
                    <label className="block text-white text-sm font-semibold mb-2">Language</label>
                    <select
                      className="w-48 bg-black text-green-200 font-mono rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                    >
                      <option value="c">C</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col mb-6 min-h-0">
                    <label className="block text-white text-sm font-semibold mb-2">Code Editor</label>
                    <div className="flex-1 min-h-0">
                      <MonacoEditor
                        height="300px"
                        width="100%"
                        theme="vs-dark"
                        language={
                          language === "cpp" ? "cpp" :
                          language === "c" ? "c" :
                          language === "java" ? "java" :
                          language === "python" ? "python" : "plaintext"
                        }
                        value={code}
                        onChange={value => {
                          setCode(value || "");
                          lastAnalyzedCodeRef.current = "";
                        }}
                        options={{
                          fontSize: 16,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: "off",
                          fontFamily: "Fira Mono, monospace",
                          automaticLayout: true,
                          lineNumbers: "on",
                          renderLineHighlight: "all",
                          formatOnPaste: true,
                          formatOnType: true,
                          tabSize: 2,
                          scrollbar: { vertical: "auto" },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Allotment.Pane>
              <Allotment.Pane>
                {/* Right-Bottom: Custom Test Case & Output */}
                <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 modal-scrollbar overflow-y-auto h-full" style={{ fontFamily: 'Fira Mono, monospace' }}>
                  <label className="block text-[#00ff99] text-base font-bold mb-2">Custom Test Case</label>
                  <textarea
                    className="w-full border-2 border-[#00cfff] rounded-lg px-4 py-3 mb-4 bg-[#181c24] text-[#baffea] font-mono focus:outline-none focus:ring-2 focus:ring-[#00ff99] placeholder-[#baffea] resize-y whitespace-pre overflow-x-auto"
                    rows={3}
                    placeholder="Enter custom input..."
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                  />
                  <div className="flex justify-end space-x-3 mt-2">
                    <button
                      onClick={handleRun}
                      className={`px-6 py-2 rounded-lg font-bold text-base transition-all border-2 border-[#00cfff] bg-[#181c24] text-[#00cfff] hover:bg-[#232b3a] hover:text-[#00ff99] shadow ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center justify-center mr-2">
                          <span className="neon-spinner"></span>
                        </span>
                      ) : null}
                      Run
                    </button>
                    <button
                      onClick={handleSubmit}
                      className={`px-6 py-2 rounded-lg font-bold text-base transition-all border-2 border-[#00ff99] bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] hover:from-[#00cfff] hover:to-[#00ff99] shadow ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center justify-center mr-2">
                          <span className="neon-spinner"></span>
                        </span>
                      ) : null}
                      Submit
                    </button>
                  </div>
                  {output && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-[#00cfff] mb-2">Output:</h3>
                      {typeof output === 'object' && output.type === 'TLE' && (
                        <pre className="bg-[#181c24] border-l-4 border-yellow-400 p-3 rounded text-yellow-300 font-bold">TLE: Time limit exceeded</pre>
                      )}
                      {typeof output === 'object' && output.type === 'RE' && (
                        <pre className="bg-[#181c24] border-l-4 border-red-500 p-3 rounded text-red-300 font-bold">RE: {output.message}</pre>
                      )}
                      {typeof output === 'object' && output.type === 'CE' && (
                        <div className="bg-[#181c24] border-l-4 border-yellow-400 p-3 rounded">
                          <div className="text-yellow-300 font-bold mb-1">CE: Compilation error</div>
                          <pre className="text-[#e0e0e0] whitespace-pre-wrap font-mono text-base leading-relaxed">
                            {formatOutputMessage(output.message)}
                          </pre>
                        </div>
                      )}
                      {typeof output === 'object' && output.type === 'MLE' && (
                        <div className="bg-[#181c24] border-l-4 border-purple-500 p-3 rounded">
                          <div className="text-purple-300 font-bold mb-1">MLE: Memory limit exceeded</div>
                          <pre className="text-[#e0e0e0] whitespace-pre-wrap font-mono text-base leading-relaxed">
                            {formatOutputMessage(output.message)}
                          </pre>
                        </div>
                      )}
                      {!(typeof output === 'object' && (output.type === 'RE' || output.type === 'CE' || output.type === 'TLE' || output.type === 'MLE')) && (
                        <pre
                          className="bg-[#181c24] border-l-4 border-[#00cfff] p-3 rounded font-mono text-base leading-relaxed text-[#baffea]"
                          style={{
                            whiteSpace: "pre-wrap",
                            overflowX: "auto",
                            overflowY: "auto",
                            maxHeight: "300px",
                            wordBreak: "break-word",
                            tabSize: 2
                          }}
                        >
                          {formatOutputMessage(
                            (() => {
                              if (output === null || output === undefined) return "";
                              
                              let outputText = "";
                              if (typeof output === "object" && output !== null && "stderr" in output) {
                                outputText = output.stderr;
                              } else if (typeof output === "object" && output !== null && "error" in output) {
                                outputText = output.error;
                              } else if (typeof output === "string") {
                                outputText = output;
                              } else {
                                outputText = JSON.stringify(output, null, 2);
                              }
                              
                              return outputText;
                            })()
                          )}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
        </Allotment>
      </div>
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white text-black rounded-lg shadow-lg p-6 min-w-[280px] text-center">
            <div className="mb-4 font-bold text-lg">{popupMessage}</div>
            <button
              className="mt-2 px-6 py-2 rounded bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-[#181c24] font-bold shadow hover:from-[#00cfff] hover:to-[#00ff99]"
              onClick={() => setShowPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* Resize Hint */}
      <div className={`fixed bottom-5 right-5 bg-[#00cfff] text-black p-4 rounded-lg shadow-lg z-50 transition-all duration-500 ease-in-out ${showResizeHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
        <p className="text-sm font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pro Tip: You can resize the panels by dragging the separators!
        </p>
      </div>
    </>
  );
};

export default ProblemDetails; 
