import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://dental-app-backend-vz9d.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies if using httpOnly tokens
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, 
            { refreshToken }
          );
          
          // Store new tokens
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject({
          message: 'Session expired. Please login again.',
          status: 401
        });
      }
    }

    // Handle other errors
    if (error.response) {
      const errorMessage = error.response.data?.message || 
                         error.response.statusText || 
                         'An unexpected error occurred';
      
      return Promise.reject({
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.'
      });
    } else {
      return Promise.reject({
        message: 'Request configuration error'
      });
    }
  }
);

const apiService = {
  // ============ Appointments ============
  getAppointments: async () => {
    try {
      const response = await api.get('/appointments/my-appointments');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        status: error.status,
        data: error.data
      };
    }
  },
  
  createAppointment: async (data) => {
    try {
      const response = await api.post('/appointments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        status: error.status,
        data: error.data
      };
    }
  },
  
  updateAppointment: async (id, data) => {
    try {
      const response = await api.put(`/appointments/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        status: error.status,
        data: error.data
      };
    }
  },
  
  cancelAppointment: async (id) => {
    try {
      const response = await api.patch(`/appointments/${id}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        status: error.status,
        data: error.data
      };
    }
  },
  
  // ============ Dentists & Procedures ============
  getDentists: async () => {
    try {
      const response = await api.get('/dentists');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        status: error.status,
        data: error.data
      };
    }
  },
  
  getProcedures: async () => {
    try {
      const response = await api.get('/procedures');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        status: error.status,
        data: error.data
      };
    }
  },
  
  // ============ Authentication ============
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed',
        status: error.status
      };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Registration failed',
        status: error.status
      };
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch profile',
        status: error.status
      };
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Logout failed',
        status: error.status
      };
    }
  },
  
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to send reset link',
        status: error.status
      };
    }
  },
  
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Token refresh failed',
        status: error.status
      };
    }
  },
  
  // ============ File Uploads ============
  uploadFile: async (file, endpoint) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'File upload failed',
        status: error.status
      };
    }
  }
};

export default apiService;