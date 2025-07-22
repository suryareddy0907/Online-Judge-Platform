import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { getProblemById } from "../services/authService";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || "http://localhost:5000";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const fetchDiscussion = async (problemId) => {
  const res = await fetch(`${API_BASE_URL}/problems/${problemId}/discussion`);
  if (!res.ok) throw new Error('Failed to fetch discussion');
  const data = await res.json();
  return data.comments.map(c => ({
    ...c,
    id: c._id,
  }));
};

const postCommentAPI = async (problemId, text, parentId = null) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/problems/${problemId}/discussion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ text, parentId })
  });
  if (!res.ok) throw new Error('Failed to post comment');
  const data = await res.json();
  return { ...data.comment, id: data.comment._id };
};

const deleteCommentAPI = async (commentId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/problems/discussion/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  });
  if (!res.ok) throw new Error('Failed to delete comment');
};

const editCommentAPI = async (commentId, text) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/problems/discussion/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Failed to edit comment');
  const data = await res.json();
  return { ...data.comment, id: data.comment._id };
};

const ProblemDiscussion = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problemTitle, setProblemTitle] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const socketRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    // Fetch problem title from API
    const fetchTitle = async () => {
      try {
        const data = await getProblemById(id);
        setProblemTitle(data.problem?.title || `Problem #${id}`);
      } catch {
        setProblemTitle(`Problem #${id}`);
      }
    };
    fetchTitle();
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchDiscussion(id)
      .then(setComments)
      .catch(() => setError("Failed to load discussion."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // Connect to socket.io and join the problem room
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("joinDiscussion", { problemId: id });
    socket.on("newComment", (comment) => {
      setComments((prev) => [comment, ...prev]);
    });
    return () => {
      socket.emit("leaveDiscussion", { problemId: id });
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    socket.on("deleteComment", ({ commentId }) => {
      setComments((prev) => prev.map(c => c.id === commentId ? { ...c, deleted: true } : c));
    });
    return () => {
      socket.off("deleteComment");
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    socket.on("editComment", (updated) => {
      setComments((prev) => prev.map(c => c.id === updated.id ? { ...c, text: updated.text, edited: true, editedAt: updated.editedAt } : c));
    });
    return () => {
      socket.off("editComment");
    };
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      // Save to backend
      const comment = await postCommentAPI(id, newComment.trim(), replyTo);
      socketRef.current.emit("postComment", { ...comment, problemId: id });
      setNewComment("");
      setReplyTo(null);
    } catch {
      setError("Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
    setNewComment("");
    setEditId(null);
  };

  const handleEdit = (commentId, text) => {
    setEditId(commentId);
    setEditText(text);
    setReplyTo(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user || !editText.trim()) return;
    try {
      const updated = await editCommentAPI(editId, editText.trim());
      socketRef.current.emit("editComment", { ...updated, problemId: id });
      setEditId(null);
      setEditText("");
    } catch {
      setError("Failed to edit comment.");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteCommentAPI(commentId);
      socketRef.current.emit("deleteComment", { commentId, problemId: id });
    } catch {
      setError("Failed to delete comment.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#181c24] text-white font-mono px-4 py-8">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-6 tracking-tight">Problem: {problemTitle}</h1>
      <div className="mb-8">
        <form onSubmit={handlePost} className="flex flex-col gap-2">
          <textarea
            className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner resize-none"
            placeholder={user ? "Add a comment..." : "Login to post a comment"}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={!user || posting}
            rows={3}
          />
          <button
            type="submit"
            className="self-end px-6 py-2 rounded bg-[#00cfff] text-[#181c24] font-bold border-2 border-[#00cfff] hover:bg-[#181c24] hover:text-[#00cfff] transition-all disabled:opacity-50"
            disabled={!user || posting || !newComment.trim()}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
      <div>
        {loading ? (
          <div className="text-[#baffea]">Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div className="text-[#baffea]">No comments yet. Be the first to discuss!</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <ul className="space-y-4">
            {comments.filter(c => !c.parentId).map((c) => (
              <li key={c.id} className="bg-[#232b3a] border-l-4 border-[#00cfff] rounded p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#00cfff]">{c.user}</span>
                  <span className="text-xs text-[#baffea]">{c.createdAt}</span>
                  {c.edited && <span className="ml-2 text-xs text-[#00ff99]">(edited)</span>}
                  {user && c.user === user.username && !c.deleted && (
                    <>
                      <button
                        className="ml-2 px-2 py-0.5 text-xs rounded bg-yellow-700 text-white hover:bg-yellow-900"
                        onClick={() => handleEdit(c.id, c.text)}
                      >
                        Edit
                      </button>
                      <button
                        className="ml-2 px-2 py-0.5 text-xs rounded bg-red-700 text-white hover:bg-red-900"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {!c.deleted && (
                    <button
                      className="ml-2 px-2 py-0.5 text-xs rounded bg-[#00cfff] text-[#181c24] hover:bg-[#181c24] hover:text-[#00cfff]"
                      onClick={() => handleReply(c.id)}
                    >
                      Reply
                    </button>
                  )}
                </div>
                {editId === c.id ? (
                  <form onSubmit={handleEditSubmit} className="flex flex-col gap-2 mt-2">
                    <textarea
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner resize-none"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-1 rounded bg-[#00ff99] text-[#181c24] font-bold border-2 border-[#00ff99] hover:bg-[#181c24] hover:text-[#00ff99]">Save</button>
                      <button type="button" className="px-4 py-1 rounded bg-gray-600 text-white border-2 border-gray-600" onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="text-[#baffea] italic">
                    {c.deleted ? "This message has been deleted" : c.text}
                  </div>
                )}
                {/* Replies */}
                <ul className="space-y-2 mt-2 ml-8">
                  {comments.filter(r => r.parentId === c.id).map(r => (
                    <li key={r.id} className="bg-[#232b3a] border-l-4 border-[#00ff99] rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#00ff99]">{r.user}</span>
                        <span className="text-xs text-[#baffea]">{r.createdAt}</span>
                        {r.edited && <span className="ml-2 text-xs text-[#00ff99]">(edited)</span>}
                        {user && r.user === user.username && !r.deleted && (
                          <>
                            <button
                              className="ml-2 px-2 py-0.5 text-xs rounded bg-yellow-700 text-white hover:bg-yellow-900"
                              onClick={() => handleEdit(r.id, r.text)}
                            >
                              Edit
                            </button>
                            <button
                              className="ml-2 px-2 py-0.5 text-xs rounded bg-red-700 text-white hover:bg-red-900"
                              onClick={() => handleDelete(r.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                      {editId === r.id ? (
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2 mt-2">
                          <textarea
                            className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner resize-none"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button type="submit" className="px-4 py-1 rounded bg-[#00ff99] text-[#181c24] font-bold border-2 border-[#00ff99] hover:bg-[#181c24] hover:text-[#00ff99]">Save</button>
                            <button type="button" className="px-4 py-1 rounded bg-gray-600 text-white border-2 border-gray-600" onClick={() => setEditId(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-[#baffea] italic">
                          {r.deleted ? "This message has been deleted" : r.text}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {/* Reply box */}
                {replyTo === c.id && (
                  <form onSubmit={handlePost} className="flex flex-col gap-2 mt-2 ml-8">
                    <textarea
                      className="w-full border-2 border-[#00cfff] rounded-md px-4 py-2 bg-[#232b3a] text-white placeholder-[#baffea] font-mono shadow-inner resize-none"
                      placeholder="Write a reply..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-1 rounded bg-[#00cfff] text-[#181c24] font-bold border-2 border-[#00cfff] hover:bg-[#181c24] hover:text-[#00cfff]">Reply</button>
                      <button type="button" className="px-4 py-1 rounded bg-gray-600 text-white border-2 border-gray-600" onClick={() => setReplyTo(null)}>Cancel</button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProblemDiscussion; 