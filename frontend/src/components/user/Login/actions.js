import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../services/api'; // Using the imported apiService directly
import zxcvbn from 'zxcvbn';

export const useLoginActions = () => {
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    login: false,
    register: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    regEmail: '',
    regPassword: '',
    regConfirm: '',
    forgotEmail: '',
    rememberMe: false,
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: { suggestions: [] }
  });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const handleEmailValidation = (field, value) => {
    if (!value) {
      setErrors(prev => ({ ...prev, [field]: 'Email is required' }));
      return false;
    }
    if (!validateEmail(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Please enter a valid email address' }));
      return false;
    }
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  const calculatePasswordStrength = (password) => {
    const result = zxcvbn(password);
    setPasswordStrength({
      score: result.score,
      feedback: result.feedback
    });
  };

  const checkPasswordMatch = () => {
    if (formData.regPassword && formData.regConfirm && formData.regPassword !== formData.regConfirm) {
      setErrors(prev => ({ ...prev, passwordMatch: 'Passwords do not match' }));
      return false;
    }
    setErrors(prev => ({ ...prev, passwordMatch: '' }));
    return true;
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    if (['email', 'regEmail', 'forgotEmail'].includes(id)) {
      handleEmailValidation(id, value);
    } else if (id === 'regConfirm') {
      checkPasswordMatch();
    }
  };

  const toggleVisibility = (field) => {
    setPasswordVisible(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [id]: val }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
    
    if ((id === 'regPassword' || id === 'regConfirm') && formData.regPassword && formData.regConfirm) {
      checkPasswordMatch();
    }

    if (id === 'regPassword') {
      calculatePasswordStrength(val);
    }
  };

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await apiService.login(credentials); // Using apiService directly
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        navigate('/user');
      } else {
        throw new Error(response.message || 'Login failed');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setErrors({ form: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await apiService.register(userData); // Using apiService directly
      if (response.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setActiveTab('login');
          setShowSuccessPopup(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setErrors({ form: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await apiService.forgotPassword(email); // Using apiService directly
      if (response.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowForgotPassword(false);
          setShowSuccessPopup(false);
          setFormData(prev => ({ ...prev, forgotEmail: '' }));
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to send reset link');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to send reset link. Please try again.';
      setErrors({ forgotEmail: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    
    if (activeTab === 'login') {
      isValid = handleEmailValidation('email', formData.email) && isValid;
      if (!formData.password) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
        isValid = false;
      }
      
      if (isValid) {
        await handleLogin({
          email: formData.email,
          password: formData.password
        });
      }
    } else {
      isValid = handleEmailValidation('regEmail', formData.regEmail) && isValid;
      if (!formData.regPassword) {
        setErrors(prev => ({ ...prev, regPassword: 'Password is required' }));
        isValid = false;
      }
      isValid = checkPasswordMatch() && isValid;
      if (!formData.agreeTerms) {
        setErrors(prev => ({ ...prev, agreeTerms: 'You must agree to the terms' }));
        isValid = false;
      }
      
      if (isValid) {
        await handleRegister({
          email: formData.regEmail,
          password: formData.regPassword
        });
      }
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const isValid = handleEmailValidation('forgotEmail', formData.forgotEmail);
    if (isValid) await handleForgotPassword(formData.forgotEmail);
  };

  return {
    activeTab,
    showForgotPassword,
    passwordVisible,
    formData,
    errors,
    showSuccessPopup,
    isLoading,
    passwordStrength,
    setActiveTab,
    setShowForgotPassword,
    handleBlur,
    toggleVisibility,
    handleChange,
    handleSubmit,
    handleForgotPassword: handleForgotPasswordSubmit,
    calculatePasswordStrength
  };
};