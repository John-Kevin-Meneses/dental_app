import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle refresh token logic
api.interceptors.response.use(
  (response) => {
    // If API returns an array directly, wrap it for consistency
    if (Array.isArray(response.data)) {
      return { ...response, data: { data: response.data } };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Auto-refresh token if 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
            { refreshToken }
          );

          localStorage.setItem('token', refreshResponse.data.token);
          localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject({ message: 'Session expired. Please login again.', status: 401 });
      }
    }

    // Error normalization
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.statusText || 'An unexpected error occurred';
      return Promise.reject({
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      return Promise.reject({ message: 'Request configuration error' });
    }
  }
);

const apiService = {
  // Appointments
  getAppointments: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw { message: 'No token found', status: 401 };

      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;

      const endpoint = role === 'patient' ? '/appointments/my-appointments' : '/appointments';
      const response = await api.get(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message, status: error.status, data: error.data };
    }
  },

  createAppointment: async (data) => {
    try {
      const response = await api.post('/appointments', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message, status: error.status, data: error.data };
    }
  },

  updateAppointment: async (id, data) => {
    try {
      const response = await api.put(`/appointments/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message, status: error.status, data: error.data };
    }
  },

  cancelAppointment: async (id) => {
    try {
      const response = await api.patch(`/appointments/${id}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message, status: error.status, data: error.data };
    }
  },

  getAppointment: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message, status: error.status, data: error.data };
    }
  },

  // Dentists
  getDentists: async () => {
    try {
      const response = await api.get('/dentists');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message, status: error.status, data: error.data };
    }
  },

  // Procedures
  getProcedures: async () => {
    try {
      const response = await api.get('/procedures');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message, status: error.status, data: error.data };
    }
  },

  // Auth
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed', status: error.status };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed', status: error.status };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch profile', status: error.status };
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message || 'Logout failed', status: error.status };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to send reset link', status: error.status };
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message || 'Token refresh failed', status: error.status };
    }
  },

  // File upload
  uploadFile: async (file, endpoint) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message || 'File upload failed', status: error.status };
    }
  }
};

export default apiService;
