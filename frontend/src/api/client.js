import axios from 'axios';

// Create axios instance with default config
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';
console.log('API Base URL:', API_BASE_URL);
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
    });

    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    const message = error.response?.data?.error || error.message || 'An error occurred';
    throw new Error(message);
  }
);

// API endpoints
const api = {
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      return apiClient.post('/auth/login', credentials);
    },
    logout: async () => {
      return apiClient.post('/auth/logout');
    },
    me: async () => {
      return apiClient.get('/auth/me');
    }
  },

  // Users endpoints
  users: {
    list: async (params = {}) => {
      return apiClient.get('/users', { params });
    },
    create: async (userData) => {
      return apiClient.post('/users', userData);
    },
    update: async (id, userData) => {
      return apiClient.patch(`/users/${id}`, userData);
    }
  },

  // Resumes endpoints
  resumes: {
    list: async (params = {}) => {
      return apiClient.get('/resumes', { params });
    },
    get: async (id) => {
      return apiClient.get(`/resumes/${id}`);
    },
    create: async (formData) => {
      return apiClient.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    update: async (id, data) => {
      return apiClient.patch(`/resumes/${id}`, data);
    },
    assign: async (id, username) => {
      return apiClient.post(`/resumes/${id}/assign`, { username });
    },
    getFileUrl: async (id) => {
      return apiClient.get(`/resumes/${id}/file`);
    }
  },

  // Share links endpoints
  shareLinks: {
    create: async (resumeId, expiresInMinutes) => {
      return apiClient.post(`/resumes/${resumeId}/share`, { expiresInMinutes });
    },
    get: async (token) => {
      return apiClient.get(`/s/${token}`);
    },
    revoke: async (id) => {
      return apiClient.post(`/share/${id}/revoke`);
    },
    list: async (resumeId) => {
      return apiClient.get(`/resumes/${resumeId}/shares`);
    }
  }
};

export default api;