import React, { useState } from 'react';
import { authAPI } from '../services/api';
import './ForgotPassword.css';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.forgotPassword(email);
      setMessage('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="forgot-password-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <button 
          className="back-to-login-button"
          onClick={onBackToLogin}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword; 