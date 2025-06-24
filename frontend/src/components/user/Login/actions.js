import apiService from '../../../services/api';

// Token storage helper functions
const storeAuthToken = (token, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

export const getAuthToken = () => {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

// Validation functions
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const handleEmailValidation = (field, value, setErrors) => {
  if (!value) {
    setErrors(prev => ({ ...prev, [field]: `${field.includes('reg') ? 'Registration email' : 'Email'} is required` }));
    return false;
  } else if (!validateEmail(value)) {
    setErrors(prev => ({ ...prev, [field]: 'Please enter a valid email address' }));
    return false;
  } else {
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  }
};

export const checkPasswordMatch = (formData, setErrors) => {
  if (formData.regPassword && formData.regConfirm && 
      formData.regPassword !== formData.regConfirm) {
    setErrors(prev => ({ ...prev, passwordMatch: 'Passwords do not match' }));
    return false;
  } else {
    setErrors(prev => ({ ...prev, passwordMatch: '' }));
    return true;
  }
};

export const validateRequiredField = (field, displayName, formData, setErrors) => {
  if (!formData[field]) {
    setErrors(prev => ({ ...prev, [field]: `${displayName} is required` }));
    return false;
  }
  setErrors(prev => ({ ...prev, [field]: '' }));
  return true;
};

export const calculatePasswordStrength = (password, setPasswordStrength) => {
  const score = Math.min(Math.floor(password.length / 3), 4);
  const suggestions = [];
  
  if (password.length < 8) {
    suggestions.push('Use at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    suggestions.push('Add a number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    suggestions.push('Add a special character');
  }

  setPasswordStrength({
    score,
    feedback: { suggestions }
  });
};

// API action functions
export const loginUser = async (email, password, rememberMe, location, setErrors, setIsLoading) => {
  let isValid = true;
  const errors = {};
  
  if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  if (!password) {
    errors.password = 'Password is required';
    isValid = false;
  }

  if (!isValid) {
    setErrors(errors);
    return { success: false };
  }

  setIsLoading(true);
  try {
    const response = await apiService.login({
      email,
      password,
      rememberMe
    });
    
    // Store token based on rememberMe preference
    storeAuthToken(response.data.token, rememberMe);
    
    const from = location?.state?.from?.pathname || '/user';
    return { success: true, redirectTo: from };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Invalid email or password';
    setErrors({ form: errorMessage });
    return { success: false, error: errorMessage };
  } finally {
    setIsLoading(false);
  }
};

export const registerUser = async (formData, setErrors, setIsLoading, setShowSuccessPopup, setActiveTab) => {
  let isValid = true;
  const errors = {};
  
  // Validate all required fields
  isValid = validateRequiredField('firstName', 'First name', formData, setErrors) && isValid;
  isValid = validateRequiredField('lastName', 'Last name', formData, setErrors) && isValid;
  isValid = handleEmailValidation('regEmail', formData.regEmail, setErrors) && isValid;
  isValid = validateRequiredField('phone', 'Phone number', formData, setErrors) && isValid;
  
  if (!formData.regPassword) {
    setErrors(prev => ({ ...prev, regPassword: 'Password is required' }));
    isValid = false;
  }
  
  isValid = checkPasswordMatch(formData, setErrors) && isValid;
  
  if (!formData.agreeTerms) {
    setErrors(prev => ({ ...prev, agreeTerms: 'You must agree to the terms' }));
    isValid = false;
  }

  if (!isValid) {
    return { success: false };
  }

  setIsLoading(true);
  try {
    await apiService.register({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.regEmail,
      password: formData.regPassword,
      phone: formData.phone
    });
    
    setShowSuccessPopup(true);
    setTimeout(() => {
      setActiveTab('login');
      setShowSuccessPopup(false);
    }, 3000);
    
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    setErrors({ form: errorMessage });
    return { success: false, error: errorMessage };
  } finally {
    setIsLoading(false);
  }
};

export const forgotPassword = async (email, setErrors, setIsLoading, setShowSuccessPopup, setShowForgotPassword) => {
  const isValid = handleEmailValidation('forgotEmail', email, setErrors);
  
  if (!isValid) {
    return { success: false };
  }

  setIsLoading(true);
  try {
    await apiService.forgotPassword({ email });
    
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setShowSuccessPopup(false);
    }, 3000);
    
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to send reset link';
    setErrors({ forgotEmail: errorMessage });
    return { success: false, error: errorMessage };
  } finally {
    setIsLoading(false);
  }
};

export const validateSession = async () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await apiService.validateToken(token);
    return response.data.valid;
  } catch (error) {
    clearAuthTokens();
    return false;
  }
};