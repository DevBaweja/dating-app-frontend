import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('No reset token provided');
      setCheckingToken(false);
      return;
    }

    const verifyToken = async () => {
      try {
        await authAPI.verifyResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setError('Invalid or expired reset token');
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authAPI.resetPassword(token, password);
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2>Verifying Reset Token...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2>Invalid Reset Token</h2>
          <p className="error-message">{error}</p>
          <button 
            className="back-to-login-button"
            onClick={() => navigate('/')}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p>Enter your new password below.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <button 
          className="back-to-login-button"
          onClick={() => navigate('/')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword; 