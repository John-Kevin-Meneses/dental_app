import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import './Login.css';
import { useLoginActions } from '../../../widgets/user/login/actions';

function Login({ isLoggedIn }) {
  
  const {
    activeTab,
    showForgotPassword,
    passwordVisible,
    formData,
    errors,
    showSuccessPopup,
    setActiveTab,
    setShowForgotPassword,
    handleBlur,
    toggleVisibility,
    handleChange,
    handleSubmit,
    handleForgotPassword
  } = useLoginActions();

  if (isLoggedIn) {
    return <Navigate to="/user" replace />;
  }
  
  return (
    <div className="login-container">
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="popup-content">
            <i className="bi bi-check-circle"></i>
            <p>Password reset link sent to your email!</p>
          </div>
        </div>
      )}

      <div className="auth-card">
        <Link to="/" className="return-home-btn">
          <i className="bi bi-arrow-left"></i> Return to Home
        </Link>

        <div className="card-image-side">
          <div className="image-overlay">
            <h2 className="welcome-text">Welcome to Our Online Dental Platform</h2>
            <p className="welcome-subtext">Your smile starts here – Sign In or Register to manage your care</p>
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
                    disabled={!formData.forgotEmail || !!errors.forgotEmail}
                  >
                    Send Reset Link
                  </button>
                  <div className="back-to-login" style={{ marginTop: '20px' , textAlign: 'right'}}>
                    <Link 
                      to="#"
                      className="text-link back-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowForgotPassword(false);
                      }}
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
                    <form className="login-form" onSubmit={handleSubmit}>
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
                          />
                        </div>
                      </div>
                      <button type="submit" className="submit-btn">Login</button>
                      <div className="forgot-password-link" style={{ marginTop: '20px', textAlign: 'right' }}>
                        <Link 
                          to="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            setShowForgotPassword(true);
                          }}
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </form>
                  ) : (
                    <form className="register-form" onSubmit={handleSubmit}>
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
                            onChange={handleChange}
                            required
                          />
                          <i
                            className={`bi bi-eye${passwordVisible.register ? '-slash' : ''} toggle-icon`}
                            onClick={() => toggleVisibility('register')}
                          />
                        </div>
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
                            required
                          />
                          <i
                            className={`bi bi-eye${passwordVisible.confirm ? '-slash' : ''} toggle-icon`}
                            onClick={() => toggleVisibility('confirm')}
                          />
                        </div>
                        {errors.passwordMatch && (
                          <div className="error-message">
                            <i className="bi bi-exclamation-circle"></i> {errors.passwordMatch}
                          </div>
                        )}
                      </div>
                      <button type="submit" className="submit-btn">Create Account</button>
                      <div className="terms-agreement">
                        By registering, you agree to our <Link to="/terms">Terms of Service</Link>
                      </div>
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