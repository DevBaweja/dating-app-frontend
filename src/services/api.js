import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check if backend server is running');
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (email, password) => 
    api.post('/users/register', { email, password }),
  
  login: (email, password) => 
    api.post('/users/login', { email, password }),
  
  getCurrentUser: () => 
    api.get('/users/me'),
  
  updateUser: (data) => 
    api.put('/users/me', data),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/users/password', { currentPassword, newPassword }),
  
  deleteAccount: () => 
    api.delete('/users/me'),
  
  // Password reset functionality
  forgotPassword: (email) => 
    api.post('/users/forgot-password', { email }),
  
  resetPassword: (token, newPassword) => 
    api.post('/users/reset-password', { token, newPassword }),
  
  verifyResetToken: (token) => 
    api.get(`/users/verify-reset-token/${token}`),
};

// Profiles API calls
export const profilesAPI = {
  getAllProfiles: () => 
    api.get('/profiles'),
  
  getProfile: (id) => 
    api.get(`/profiles/${id}`),
  
  createProfile: (profileData) => 
    api.post('/profiles', profileData),
  
  updateProfile: (id, profileData) => 
    api.put(`/profiles/${id}`, profileData),
  
  deleteProfile: (id) => 
    api.delete(`/profiles/${id}`),
  
  seedProfiles: () => 
    api.post('/profiles/seed'),
};

// Matches API calls
export const matchesAPI = {
  getMatches: () => 
    api.get('/matches'),
  
  likeProfile: (profileId, superLiked = false) => 
    api.post(`/matches/like/${profileId}`, { superLiked }),
  
  superLikeProfile: (profileId) => 
    api.post(`/matches/superlike/${profileId}`),
  
  passProfile: (profileId) => 
    api.post(`/matches/pass/${profileId}`),
  
  getLikedProfiles: () => 
    api.get('/matches/liked'),
  
  removeMatch: (profileId) => 
    api.delete(`/matches/${profileId}`),
  
  getStats: () => 
    api.get('/matches/stats'),
};

export default api; 