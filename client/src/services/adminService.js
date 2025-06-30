const API_BASE_URL = import.meta.env.VITE_API_URL + '/admin';

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

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==================== USER MANAGEMENT ====================
export const getAllUsers = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateUserRole = async (userId, role) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role })
  });
  return handleResponse(response);
};

export const toggleUserBan = async (userId, isBanned) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isBanned })
  });
  return handleResponse(response);
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateUserDetails = async (userId, userData) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

// ==================== PROBLEM MANAGEMENT ====================
export const getAllProblems = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}/problems?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const createProblem = async (problemData) => {
  const response = await fetch(`${API_BASE_URL}/problems`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(problemData)
  });
  return handleResponse(response);
};

export const updateProblem = async (problemId, problemData) => {
  const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(problemData)
  });
  return handleResponse(response);
};

export const deleteProblem = async (problemId) => {
  const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const toggleProblemPublish = async (problemId, isPublished) => {
  const response = await fetch(`${API_BASE_URL}/problems/${problemId}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isPublished })
  });
  return handleResponse(response);
};

// ==================== SUBMISSION MANAGEMENT ====================
export const getAllSubmissions = async (params = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}/submissions?${queryParams}`, {
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

export const deleteSubmission = async (submissionId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete submission');
  }
  return response.json();
};

export const getSubmissionDetails = async (submissionId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch submission details');
  }
  return response.json();
};

// ==================== CONTEST MANAGEMENT ====================
export const getAllContests = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}/contests?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const createContest = async (contestData) => {
  const response = await fetch(`${API_BASE_URL}/contests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(contestData)
  });
  return handleResponse(response);
};

export const updateContest = async (contestId, contestData) => {
  const response = await fetch(`${API_BASE_URL}/contests/${contestId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(contestData)
  });
  return handleResponse(response);
};

export const deleteContest = async (contestId) => {
  const response = await fetch(`${API_BASE_URL}/contests/${contestId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};