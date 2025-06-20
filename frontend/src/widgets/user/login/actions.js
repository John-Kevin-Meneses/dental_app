// C:\Users\kevsm\Desktop\Dental App\frontend\src\widgets\user\login\actions.js
import { useState } from 'react';

export const useLoginActions = () => {
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
    forgotEmail: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    regEmail: '',
    forgotEmail: '',
    passwordMatch: ''
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Email validation helper
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle email validation for all forms
  const handleEmailValidation = (field, value) => {
    if (!value) {
      setErrors(prev => ({ ...prev, [field]: 'Email is required' }));
      return false;
    } else if (!validateEmail(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Please enter a valid email address' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }
  };

  // Check if passwords match during registration
  const checkPasswordMatch = () => {
    if (formData.regPassword && formData.regConfirm && 
        formData.regPassword !== formData.regConfirm) {
      setErrors(prev => ({ ...prev, passwordMatch: 'Passwords do not match' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, passwordMatch: '' }));
      return true;
    }
  };

  // Handle blur events for form fields
  const handleBlur = (e) => {
    const { id, value } = e.target;
    if (id === 'email' || id === 'regEmail' || id === 'forgotEmail') {
      handleEmailValidation(id, value);
    } else if (id === 'regConfirm') {
      checkPasswordMatch();
    }
  };

  // Toggle password visibility
  const toggleVisibility = (field) => {
    setPasswordVisible(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
    
    // Check password match in real-time
    if ((id === 'regPassword' || id === 'regConfirm') && 
        formData.regPassword && formData.regConfirm) {
      checkPasswordMatch();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    
    if (activeTab === 'login') {
      isValid = handleEmailValidation('email', formData.email) && isValid;
      if (!formData.password) {
        isValid = false;
      }
    } else {
      isValid = handleEmailValidation('regEmail', formData.regEmail) && isValid;
      if (!formData.regPassword || !formData.regConfirm) {
        isValid = false;
      }
      isValid = checkPasswordMatch() && isValid;
    }

    if (isValid) {
      console.log('Form submitted successfully');
      // Add your form submission logic here
    }
  };

  // Handle forgot password flow
  const handleForgotPassword = (e) => {
    e.preventDefault();
    const isValid = handleEmailValidation('forgotEmail', formData.forgotEmail);
    
    if (isValid) {
      console.log('Password reset requested for', formData.forgotEmail);
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setShowSuccessPopup(false);
        setFormData(prev => ({ ...prev, forgotEmail: '' }));
      }, 3000);
    }
  };

  // Return all state and handlers for the component to use
  return {
    // State values
    activeTab,
    showForgotPassword,
    passwordVisible,
    formData,
    errors,
    showSuccessPopup,
    
    // State setters
    setActiveTab,
    setShowForgotPassword,
    
    // Handlers
    handleBlur,
    toggleVisibility,
    handleChange,
    handleSubmit,
    handleForgotPassword
  };
};