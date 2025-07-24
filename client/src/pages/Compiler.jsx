import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function getBoilerplate(lang) {
  switch (lang) {
    case "cpp":
      return `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}`;
    case "c":
      return `#include <stdio.h>\n\nint main() {\n    // your code goes here\n    return 0;\n}`;
    case "java":
      return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // your code goes here\n    }\n}`;
    case "python":
      return `# your code goes here\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()`;
    default:
      return "";
  }
}

const Compiler = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState(getBoilerplate("cpp"));
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [isLoading, setIsLoading] = useState(false);
  const [showResizeHint, setShowResizeHint] = useState(true);
  const allotmentRef = useRef(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    setCode(getBoilerplate(language));
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(() => setShowResizeHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRun = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsLoading(true);
    setOutput("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/run`, {
        code,
        language,
        input, // use the input state here
      });
      setOutput(response.data.output || response.data.stderr || response.data.error || "");
    } catch (err) {
      setOutput(
        err.response?.data?.stderr || err.response?.data?.output || err.response?.data?.error || err.message || "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#181c24] font-mono text-white">
      <Allotment vertical ref={allotmentRef}>
        <Allotment.Pane minSize={200} preferredSize={400}>
          <div className="h-full flex flex-col bg-[#18181b] p-8">
            <div className="mb-4 flex items-center gap-4">
              <label className="block text-white text-sm font-semibold">Language</label>
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
              <button
                onClick={handleRun}
                className={`ml-auto px-6 py-2 rounded-lg font-bold text-base transition-all border-2 border-[#00cfff] bg-[#181c24] text-[#00cfff] hover:bg-[#232b3a] hover:text-[#00ff99] shadow ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center mr-2">
                    <span className="spinner-circle"></span>
                  </span>
                ) : null}
                Run
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <MonacoEditor
                height="100%"
                width="100%"
                theme="vs-dark"
                language={language === "cpp" ? "cpp" : language === "c" ? "c" : language === "java" ? "java" : language === "python" ? "python" : "plaintext"}
                value={code}
                onChange={value => setCode(value || "")}
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
        </Allotment.Pane>
        <Allotment.Pane minSize={100} preferredSize={200}>
          <div className="bg-[#232b3a] border-2 border-[#00cfff] rounded-xl shadow-lg p-6 modal-scrollbar overflow-y-auto h-full flex flex-col" style={{ fontFamily: 'Fira Mono, monospace' }}>
            <h3 className="text-lg font-bold text-[#00cfff] mb-2">Output:</h3>
            <pre
              className="bg-[#181c24] border-l-4 border-[#00cfff] p-3 rounded font-mono text-base leading-relaxed text-[#baffea] mb-4"
              style={{
                whiteSpace: "pre",
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: "200px",
                maxWidth: "100%",
                wordBreak: "break-all",
                tabSize: 2
              }}
            >
              {output}
            </pre>
            <label className="block text-white text-sm font-semibold mb-1" htmlFor="compiler-input">Input:</label>
            <textarea
              id="compiler-input"
              className="w-full bg-[#181c24] border border-[#00cfff] rounded-lg p-2 text-[#baffea] font-mono resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter input for your program here..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              style={{ marginBottom: '0.5rem' }}
            />
          </div>
        </Allotment.Pane>
      </Allotment>
      {/* Resize Hint */}
      <div className={`fixed bottom-5 right-5 bg-[#00cfff] text-black p-4 rounded-lg shadow-lg z-50 transition-all duration-500 ease-in-out ${showResizeHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
        <p className="text-sm font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pro Tip: You can resize the panels by dragging the separators!
        </p>
      </div>
    </div>
  );
};

export default Compiler; 