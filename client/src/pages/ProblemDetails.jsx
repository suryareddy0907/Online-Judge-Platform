import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getPublicProblems } from "../services/authService";
import axios from "axios";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

const ProblemDetails = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [language, setLanguage] = useState("cpp"); // Default language is C++
  const allotmentRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        // getPublicProblems returns a list, so fetch by id and filter client-side for now
        const data = await getPublicProblems({});
        const found = data.problems.find((p) => p._id === id);
        setProblem(found);
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
    try {
      const response = await axios.post("http://localhost:5000/api/run", {
        code: code,
        language: language,
      });
      setOutput(response.data.output);
    } catch (err) {
      setOutput(
        err.response?.data?.output ||
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred."
      );
    }
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
                      <div><span className="font-semibold">Input:</span> <span className="font-mono">{tc.input}</span></div>
                      <div><span className="font-semibold">Output:</span> <span className="font-mono">{tc.output}</span></div>
                      {tc.explanation && <div className="mt-1 text-gray-600 text-sm"><span className="font-semibold">Explanation:</span> {tc.explanation}</div>}
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
                    <option value="py">Python</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col mb-6 min-h-0">
                  <label className="block text-white text-sm font-semibold mb-2">Code Editor</label>
                  <textarea
                    className="w-full flex-1 min-h-0 bg-black text-green-200 font-mono rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your code here..."
                    spellCheck={false}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
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
                  <button onClick={handleRun} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run</button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled>Submit</button>
                </div>
                {output && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Output:</h3>
                    <pre
                      className="bg-gray-100 p-2 rounded"
                      style={{
                        whiteSpace: "pre-wrap",
                        overflowX: "hidden",
                        overflowY: "auto",
                        maxHeight: "300px"
                      }}
                    >{
                      (() => {
                        if (output === null || output === undefined) return "";
                        let err = "";
                        if (typeof output === "object" && output !== null && "stderr" in output) {
                          err = output.stderr;
                        } else if (typeof output === "object" && output !== null && "error" in output) {
                          err = output.error;
                        } else if (typeof output === "string") {
                          err = output;
                        } else {
                          err = JSON.stringify(output, null, 2);
                        }
                        // Filter out lines with internal paths
                        const filtered = err
                          .split('\n')
                          .filter(line =>
                            !line.includes('/codes/') &&
                            !line.includes('outputs/') &&
                            !line.includes('\\') && // for Windows paths
                            !line.includes('.cpp: note:') // optional: filter out some verbose notes
                          )
                          .join('\n');
                        return filtered.trim();
                      })()
                    }</pre>
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