import axios from "axios";
import { io } from 'socket.io-client';

const API_BASE_URL = 'https://online-judge-platform-6xta.onrender.com/api/auth';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Register user
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// Login user
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });
  return handleResponse(response);
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await fetch(`${API_BASE_URL}/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData),
  });
  return handleResponse(response);
};

// Get user profile
export const getUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

// Public: Get published problems
export const getPublicProblems = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/problems?${queryParams}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const getMySubmissions = async (params = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/problems/my-submissions?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch submissions');
  }
  return response.json();
};

// Public: Get home page stats
export const getPublicStats = async () => {
  const token = localStorage.getItem('token');
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const response = await fetch('https://online-judge-platform-6xta.onrender.com/api/admin/public-stats', { headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch stats');
  }
  return response.json();
};

// Get leaderboard data
export const getLeaderboard = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/leaderboard?${queryParams}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch leaderboard');
  }
  return response.json();
};

// Get recent activity feed
export const getRecentActivity = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/leaderboard/activity?${queryParams}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch recent activity');
  }
  return response.json();
};

// Get number of unique problems solved by a user
export const getUserSolvedCount = async (userId) => {
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/admin/user/${userId}/solved-count`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch solved count');
  }
  return response.json();
};

export const getPublicContests = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/contests?${queryParams}`, { headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch contests');
  }
  return response.json();
};

// Only one socket instance for the whole app
export const socket = io('https://online-judge-platform-6xta.onrender.com');

// Add socket connection debugging
socket.on('connect', () => {
  console.log('Socket connected with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('test', (data) => {
  console.log('Received test event:', data);
});

export const registerForContest = async (contestId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/contests/${contestId}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // Not JSON (probably HTML error page)
    if (response.status === 401 || response.status === 403) {
      throw new Error('You must be logged in to register for a contest. Please login.');
    }
    throw new Error('Server error. Please try again later.');
  }
  if (!response.ok) {
    throw new Error(data.message || 'Failed to register for contest');
  }
  return data;
};

export const unregisterForContest = async (contestId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/contests/${contestId}/register`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('You must be logged in to unregister from a contest. Please login.');
    }
    throw new Error('Server error. Please try again later.');
  }
  if (!response.ok) {
    throw new Error(data.message || 'Failed to unregister from contest');
  }
  return data;
};

export const getContestLeaderboard = async (contestId) => {
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/contests/${contestId}/leaderboard`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch contest leaderboard');
  }
  return response.json();
};

export const getProblemById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/problems/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch problem');
  }
  return response.json();
};

export const getContestDetails = async (contestId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`https://online-judge-platform-6xta.onrender.com/api/contests/${contestId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch contest details');
  }
  return response.json();
};
