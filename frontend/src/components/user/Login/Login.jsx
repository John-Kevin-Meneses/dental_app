import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import apiService from '../../../services/api';
import './Login.css';

function Login({ isLoggedIn }) {
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    login: false,
    register: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    password: '',
    rememberMe: false,
    
    // Registration fields
    firstName: '',
    lastName: '',
    regEmail: '',
    regPassword: '',
    regConfirm: '',
    phone: '',
    agreeTerms: false,
    
    // Forgot password
    forgotEmail: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: { suggestions: [] }
  });

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Field validation handlers
  const handleEmailValidation = (field, value) => {
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

  const validateRequiredField = (field, displayName) => {
    if (!formData[field]) {
      setErrors(prev => ({ ...prev, [field]: `${displayName} is required` }));
      return false;
    }
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  // Event handlers
  const handleBlur = (e) => {
    const { id, value } = e.target;
    
    if (id === 'email' || id === 'regEmail' || id === 'forgotEmail') {
      handleEmailValidation(id, value);
    } else if (id === 'regConfirm') {
      checkPasswordMatch();
    } else if (id === 'firstName') {
      validateRequiredField('firstName', 'First name');
    } else if (id === 'lastName') {
      validateRequiredField('lastName', 'Last name');
    } else if (id === 'phone') {
      validateRequiredField('phone', 'Phone number');
    }
  };

  const toggleVisibility = (field) => {
    setPasswordVisible(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [id]: val
    }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
    
    if ((id === 'regPassword' || id === 'regConfirm') && 
        formData.regPassword && formData.regConfirm) {
      checkPasswordMatch();
    }
    
    if (id === 'regPassword') {
      calculatePasswordStrength(value);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    const score = Math.min(Math.floor(password.length / 3), 4);
    setPasswordStrength({
      score,
      feedback: { suggestions: [] }
    });
  };

  const getPasswordStrengthClass = () => {
    if (passwordStrength.score < 2) return 'weak';
    if (passwordStrength.score < 4) return 'medium';
    return 'strong';
  };

  // Form submission handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    let isValid = true;
    
    isValid = handleEmailValidation('email', formData.email) && isValid;
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      try {
        const response = await apiService.login({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        });
        localStorage.setItem('token', response.data.token);
        window.location.href = '/user';
      } catch (error) {
        setErrors({ 
          form: error.response?.data?.message || 'Invalid email or password' 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Validate all required fields
    isValid = validateRequiredField('firstName', 'First name') && isValid;
    isValid = validateRequiredField('lastName', 'Last name') && isValid;
    isValid = handleEmailValidation('regEmail', formData.regEmail) && isValid;
    isValid = validateRequiredField('phone', 'Phone number') && isValid;
    
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
      } catch (error) {
        setErrors({ 
          form: error.response?.data?.message || 'Registration failed. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const isValid = handleEmailValidation('forgotEmail', formData.forgotEmail);
    
    if (isValid) {
      setIsLoading(true);
      try {
        await apiService.forgotPassword({ email: formData.forgotEmail });
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowForgotPassword(false);
          setShowSuccessPopup(false);
          setFormData(prev => ({ ...prev, forgotEmail: '' }));
        }, 3000);
      } catch (error) {
        setErrors({ forgotEmail: error.response?.data?.message || 'Failed to send reset link' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/user" replace />;
  }

  return (
    <div className="login-container">
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="popup-content">
            <i className="bi bi-check-circle"></i>
            <p>
              {activeTab === 'register' 
                ? 'Registration successful! Please log in.'
                : 'Password reset link sent to your email!'}
            </p>
          </div>
        </div>
      )}

      <div className="auth-card">
        <Link to="/" className="return-home-btn">
          <i className="bi bi-arrow-left"></i> Return to Home
        </Link>

        <div className="card-image-side">
          <div className="image-overlay">
            <h2 className="welcome-text">Welcome to Our Platform</h2>
            <p className="welcome-subtext">Sign in or register to access your account</p>
          </div>
        </div>

        <div className="card-form-side">
          <div className="form-content">
            {showForgotPassword ? (
              <div className="forgot-password-form">
                <h3>Reset Password</h3>
                <p>Enter your email to receive a password reset link</p>
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label htmlFor="forgotEmail">Email address</label>
                    <input 
                      type="email" 
                      id="forgotEmail" 
                      placeholder="Enter your email" 
                      value={formData.forgotEmail}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.forgotEmail ? 'input-error' : ''}
                      required
                      autoFocus
                    />
                    {errors.forgotEmail && (
                      <div className="error-message">
                        <i className="bi bi-exclamation-circle"></i> {errors.forgotEmail}
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={!formData.forgotEmail || !!errors.forgotEmail || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : 'Send Reset Link'}
                  </button>
                  <div className="form-footer-links">
                    <Link 
                      to="#" 
                      className="text-link back-link"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      <i className="bi bi-arrow-left"></i> Back to Login
                    </Link>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="tabs">
                  <button 
                    type="button"
                    className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveTab('login')}
                  >
                    Login
                  </button>
                  <button 
                    type="button"
                    className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                  >
                    Register
                  </button>
                </div>

                <div className="form-container">
                  {activeTab === 'login' ? (
                    <form className="login-form" onSubmit={handleLogin}>
                      {errors.form && (
                        <div className="alert alert-danger">
                          <i className="bi bi-exclamation-circle"></i> {errors.form}
                        </div>
                      )}
                      <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input 
                          type="email" 
                          id="email" 
                          placeholder="Enter your email" 
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={errors.email ? 'input-error' : ''}
                          required
                          autoFocus
                        />
                        {errors.email && (
                          <div className="error-message">
                            <i className="bi bi-exclamation-circle"></i> {errors.email}
                          </div>
                        )}
                      </div>
                      <div className="form-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                          <input
                            type={passwordVisible.login ? "text" : "password"}
                            id="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          <i
                            className={`bi bi-eye${passwordVisible.login ? '-slash' : ''} toggle-icon`}
                            onClick={() => toggleVisibility('login')}
                            aria-label={passwordVisible.login ? "Hide password" : "Show password"}
                          />
                        </div>
                        {errors.password && (
                          <div className="error-message">
                            <i className="bi bi-exclamation-circle"></i> {errors.password}
                          </div>
                        )}
                      </div>
                      <div className="form-options">
                        <div className="remember-me-container">
                          <div className="remember-me">
                            <input
                              type="checkbox"
                              id="rememberMe"
                              checked={formData.rememberMe}
                              onChange={handleChange}
                            />
                            <label htmlFor="rememberMe">Remember me</label>
                          </div>
                          <Link 
                            to="#" 
                            className="forgot-password-link"
                            onClick={() => setShowForgotPassword(true)}
                          >
                            Forgot password?
                          </Link>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in...
                          </>
                        ) : 'Login'}
                      </button>
                    </form>
                  ) : (
                    <form className="register-form" onSubmit={handleRegister}>
                      {errors.form && (
                        <div className="alert alert-danger">
                          <i className="bi bi-exclamation-circle"></i> {errors.form}
                        </div>
                      )}
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="firstName">First Name</label>
                          <input
                            type="text"
                            id="firstName"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.firstName ? 'input-error' : ''}
                            required
                            autoFocus
                          />
                          {errors.firstName && (
                            <div className="error-message">
                              <i className="bi bi-exclamation-circle"></i> {errors.firstName}
                            </div>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="lastName">Last Name</label>
                          <input
                            type="text"
                            id="lastName"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.lastName ? 'input-error' : ''}
                            required
                          />
                          {errors.lastName && (
                            <div className="error-message">
                              <i className="bi bi-exclamation-circle"></i> {errors.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={errors.phone ? 'input-error' : ''}
                          required
                        />
                        {errors.phone && (
                          <div className="error-message">
                            <i className="bi bi-exclamation-circle"></i> {errors.phone}
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="regEmail">Email address</label>
                        <input 
                          type="email" 
                          id="regEmail" 
                          placeholder="Enter your email" 
                          value={formData.regEmail}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={errors.regEmail ? 'input-error' : ''}
                          required
                        />
                        {errors.regEmail && (
                          <div className="error-message">
                            <i className="bi bi-exclamation-circle"></i> {errors.regEmail}
                          </div>
                        )}
                      </div>
                      <div className="form-group password-group">
                        <label htmlFor="regPassword">Password</label>
                        <div className="input-wrapper">
                          <input
                            type={passwordVisible.register ? "text" : "password"}
                            id="regPassword"
                            placeholder="Enter your password"
                            value={formData.regPassword}
                            onChange={(e) => {
                              handleChange(e);
                              calculatePasswordStrength(e.target.value);
                            }}
                            required
                          />
                          <i
                            className={`bi bi-eye${passwordVisible.register ? '-slash' : ''} toggle-icon`}
                            onClick={() => toggleVisibility('register')}
                            aria-label={passwordVisible.register ? "Hide password" : "Show password"}
                          />
                        </div>
                        {formData.regPassword && (
                          <div className="password-strength-meter">
                            <div className={`strength-bar ${getPasswordStrengthClass()}`} 
                                 style={{ width: `${passwordStrength.score * 25}%` }}>
                            </div>
                            <div className="strength-feedback">
                              {passwordStrength.score < 2 && (
                                <small>Weak - try adding more characters</small>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="form-group password-group">
                        <label htmlFor="regConfirm">Confirm Password</label>
                        <div className="input-wrapper">
                          <input
                            type={passwordVisible.confirm ? "text" : "password"}
                            id="regConfirm"
                            placeholder="Confirm your password"
                            value={formData.regConfirm}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.passwordMatch ? 'input-error' : ''}
                            required
                          />
                          <i
                            className={`bi bi-eye${passwordVisible.confirm ? '-slash' : ''} toggle-icon`}
                            onClick={() => toggleVisibility('confirm')}
                            aria-label={passwordVisible.confirm ? "Hide password" : "Show password"}
                          />
                        </div>
                        {errors.passwordMatch && (
                          <div className="error-message">
                            <i className="bi bi-exclamation-circle"></i> {errors.passwordMatch}
                          </div>
                        )}
                      </div>
                      <div className="terms-agreement">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="agreeTerms">I agree to the <Link to="/terms">Terms of Service</Link></label>
                        {errors.agreeTerms && (
                          <div className="error-message">
                            <i className="bi bi-exclamation-circle"></i> {errors.agreeTerms}
                          </div>
                        )}
                      </div>
                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isLoading || passwordStrength.score < 2}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registering...
                          </>
                        ) : 'Create Account'}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;