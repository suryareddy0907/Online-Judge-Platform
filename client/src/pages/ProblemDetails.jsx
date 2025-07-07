import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getProblemById } from "../services/authService";
import axios from "axios";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import MonacoEditor from "@monaco-editor/react";

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

  useEffect(() => {
    if (output && allotmentRef.current) {
      allotmentRef.current.resize([100, 400]);
    }
  }, [output]);

  const handleRun = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/run", {
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
      if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('time limit exceeded')) {
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
        `http://localhost:5000/api/problems/${id}/submit`,
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
    setAiLoading("hint");
    setHint("");
    try {
      const response = await axios.post("http://localhost:5000/api/ai/generate-hint", {
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
    setAiLoading("analyze");
    setCodeFeedback("");
    try {
      const response = await axios.post("http://localhost:5000/api/ai/analyze-code", {
        code,
        language,
        problemStatement: problem.statement,
      });
      setCodeFeedback(response.data.feedback);
    } catch (err) {
      setCodeFeedback("Failed to analyze code.");
    } finally {
      setAiLoading("");
    }
  };

  const handleGenerateBoilerplate = async () => {
    setAiLoading("boilerplate");
    try {
      const response = await axios.post("http://localhost:5000/api/ai/generate-boilerplate", {
        problemStatement: problem.statement,
        language: language,
      });
      setCode(response.data.boilerplate);
    } catch (err) {
      setOutput("Failed to generate boilerplate code.");
    } finally {
      setAiLoading("");
    }
  };

  const handleExplainProblem = async () => {
    setAiLoading("explain");
    setExplanation("");
    try {
      const response = await axios.post("http://localhost:5000/api/ai/explain-problem", {
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
      const response = await axios.post("http://localhost:5000/api/ai/debug-code", {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !problem) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Problem not found"}</div>;

  return (
    <div className="h-screen">
      <Allotment>
        <Allotment.Pane>
          {/* Left: Problem Details */}
          <div className="p-8 bg-white border-r border-gray-200 overflow-y-auto h-full">
            <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
            {/* AI Feature Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition flex items-center"
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
                onClick={handleGenerateBoilerplate}
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
            {hint && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
                <strong>Hint:</strong> {hint}
              </div>
            )}
            {codeFeedback && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-900">
                <strong>Code Feedback:</strong> {codeFeedback}
              </div>
            )}
            {explanation && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-900">
                <strong>Explanation:</strong> <span dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>') }} />
              </div>
            )}
            {debugOutput && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-900">
                <strong>Debug Output:</strong> <span dangerouslySetInnerHTML={{ __html: debugOutput.replace(/\n/g, '<br/>') }} />
              </div>
            )}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-1">Description</h2>
              <p className="text-gray-800 whitespace-pre-line">{problem.statement}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-1">Input</h2>
              <p className="text-gray-800 whitespace-pre-line">{problem.input || "-"}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-1">Constraints</h2>
              <p className="text-gray-800 whitespace-pre-line">{problem.constraints || "-"}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-1">Output</h2>
              <p className="text-gray-800 whitespace-pre-line">{problem.output || "-"}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-1">Example Test Cases</h2>
              {problem.exampleTestCases && problem.exampleTestCases.length > 0 ? (
                <div className="space-y-2">
                  {problem.exampleTestCases.map((tc, idx) => (
                    <div key={idx} className="bg-gray-50 border rounded p-2">
                      <div className="text-xs text-gray-500 mb-1">Example {idx + 1}</div>
                      <div><span className="font-semibold">Input:</span><br /><pre className="font-mono inline whitespace-pre-wrap">{tc.input}</pre></div>
                      <div><span className="font-semibold">Output:</span><br /><pre className="font-mono inline whitespace-pre-wrap">{tc.output}</pre></div>
                      {tc.explanation && <div className="mt-1 text-gray-600 text-sm"><span className="font-semibold">Explanation:</span><br /><pre className="inline whitespace-pre-wrap">{tc.explanation}</pre></div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No example test cases.</div>
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
                      onChange={value => setCode(value || "")}
                      options={{
                        fontSize: 16,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
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
              <div className="bg-white rounded-lg shadow p-4 overflow-y-auto h-full">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Custom Test Case</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter custom input..."
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleRun}
                    className={`px-4 py-2 rounded flex items-center justify-center min-w-[90px] transition-colors duration-150
                      ${isLoading ? 'bg-blue-200 text-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    ) : null}
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={`px-4 py-2 rounded flex items-center justify-center min-w-[90px] transition-colors duration-150
                      ${isLoading ? 'bg-green-200 text-green-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    ) : null}
                    Submit
                  </button>
                </div>
                {output && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Output:</h3>
                    {typeof output === 'object' && output.type === 'TLE' && (
                      <pre className="bg-gray-100 p-2 rounded text-orange-600 font-semibold">TLE: Time limit exceeded</pre>
                    )}
                    {typeof output === 'object' && output.type === 'RE' && (
                      <pre className="bg-gray-100 p-2 rounded text-red-600 font-semibold">RE: {output.message}</pre>
                    )}
                    {typeof output === 'object' && output.type === 'CE' && (
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-yellow-700 font-semibold mb-1">CE: Compilation error</div>
                        <pre className="text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                          {formatOutputMessage(output.message)}
                        </pre>
                      </div>
                    )}
                    {!(typeof output === 'object' && (output.type === 'RE' || output.type === 'CE' || output.type === 'TLE')) && (
                      <pre
                        className="bg-gray-100 p-2 rounded font-mono text-sm leading-relaxed"
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
  );
};

export default ProblemDetails;

<style>
{`
.spinner-circle {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid #fff;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}
</style> 