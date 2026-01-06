import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../services/api';
import '../../styles/LoginPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    
    try {
      await requestPasswordReset({ email: email.trim() });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      // The backend returns success even if email doesn't exist (for security)
      // So we'll show success message regardless
      if (err.response && err.response.status === 200) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(err.response?.data?.detail || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Forgot Password</h2>
      {success ? (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e5f5e5', 
          borderRadius: '4px', 
          color: '#2d5016',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0 }}>
            If an account with that email exists, a password reset link has been sent to your email.
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            The link will expire in 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}
      <p className="auth-link">
        Remember your password? <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;


