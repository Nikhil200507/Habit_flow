import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Habits API calls
export const habitsAPI = {
  getHabits: async () => {
    const response = await api.get('/habits');
    return response.data;
  },

  createHabit: async (habitData) => {
    const response = await api.post('/habits', habitData);
    return response.data;
  },

  updateHabit: async (habitId, habitData) => {
    const response = await api.put(`/habits/${habitId}`, habitData);
    return response.data;
  },

  deleteHabit: async (habitId) => {
    const response = await api.delete(`/habits/${habitId}`);
    return response.data;
  },

  completeHabit: async (habitId, completionDate) => {
    const response = await api.post(`/habits/${habitId}/complete`, {
      completion_date: completionDate,
    });
    return response.data;
  },

  uncompleteHabit: async (habitId, completionDate) => {
    const response = await api.delete(`/habits/${habitId}/complete/${completionDate}`);
    return response.data;
  },
};

// Statistics API calls
export const statsAPI = {
  getOverview: async () => {
    const response = await api.get('/stats/overview');
    return response.data;
  },
};

export default api;