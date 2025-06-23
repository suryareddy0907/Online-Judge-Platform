import React, { useEffect, useState } from "react";
import { getPublicProblems } from "../services/authService";
import { useNavigate } from "react-router-dom";

const BrowseProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const navigate = useNavigate();

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search,
        difficulty,
        tag: selectedTag,
      };
      const data = await getPublicProblems(params);
      setProblems(data.problems);
      // Collect all unique tags
      const tags = new Set();
      data.problems.forEach((p) => (p.tags || []).forEach((t) => tags.add(t)));
      setAllTags(Array.from(tags));
    } catch (err) {
      setError(err.message || "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line
  }, [search, difficulty, selectedTag]);

  // Filter by tag client-side
  const filteredProblems = selectedTag
    ? problems.filter((p) => (p.tags || []).includes(selectedTag))
    : problems;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Browse Problems</h1>
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-6">
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        {allTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="text-gray-600 mr-2">Tags:</span>
            <button
              className={`px-2 py-1 rounded-full border text-xs ${selectedTag === "" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setSelectedTag("")}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`px-2 py-1 rounded-full border text-xs ${selectedTag === tag ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading problems...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No problems found.</div>
        ) : (
          <div className="space-y-4">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-blue-50 transition"
                onClick={() => navigate(`/problems/${problem._id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{problem.title}</h2>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{problem.statement?.slice(0, 120)}{problem.statement?.length > 120 ? "..." : ""}</p>
                  </div>
                  <div className="flex flex-col md:items-end mt-2 md:mt-0">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${problem.difficulty === "Easy" ? "bg-green-100 text-green-800" : problem.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{problem.difficulty}</span>
                    <div className="flex flex-wrap gap-1">
                      {(problem.tags || []).map((tag) => (
                        <span key={tag} className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseProblems; 