import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext } from 'react';
import axios from 'axios';
import ProtectedRoute from './routes/protectedRoute';
import Login from './components/user/Login/Login.jsx';
import User from './components/user/User/User.jsx';
import Home from './components/homepage/home/home.jsx';

// 1. Create API context
const ApiContext = createContext();

// 2. Create custom hook for API access
export const useApi = () => {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApi must be used within ApiProvider');
  return api;
};

// 3. API Provider component
export const ApiProvider = ({ children }) => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Add interceptors if needed
  api.interceptors.response.use(
    response => response,
    error => {
      // Handle errors globally
      if (error.response?.status === 401) {
        // Handle unauthorized access
      }
      return Promise.reject(error);
    }
  );

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

function App() {
  return (
    <ApiProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/user" element={<User />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ApiProvider>
  );
}

export default App;