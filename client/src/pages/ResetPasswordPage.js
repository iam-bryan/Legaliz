import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress, Link,
  Paper, IconButton, InputAdornment
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiService from '../api/apiService'; // Adjust path if needed

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get the token from the URL (:token part)
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); // To show success/error messages
  const [loading, setLoading] = useState(false);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Add useEffect for error timeout ---
  useEffect(() => {
    // Set a timer to clear error messages
    if (message && message.type === 'error') {
      const timer = setTimeout(() => {
        setMessage(''); // Clear the message after 5 seconds
      }, 5000); // 5-second delay for errors

      // Cleanup function to clear timeout if component unmounts
      // or if message changes before timer fires
      return () => clearTimeout(timer);
    }
    
    // No timer needed for success, as it redirects
  }, [message]); // This effect runs whenever the 'message' state changes
  // --- End of useEffect ---

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Clear previous messages

    // --- Password Validation ---
    const passwordPolicy = "Password must be at least 8 characters, and include one uppercase letter, one lowercase letter, and one number or special character.";
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumberOrSpecial = /[0-9\W]/.test(password); // \W is non-word, same as [^a-zA-Z0-9_]

    if (!password || password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      setLoading(false);
      return;
    }

    if (!hasLowercase || !hasUppercase || !hasNumberOrSpecial) {
      setMessage({ type: 'error', text: passwordPolicy });
      setLoading(false);
      return;
    }
    // --- End Validation ---

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }
    if (!token) {
        setMessage({ type: 'error', text: 'Invalid or missing reset token.' });
        setLoading(false);
        return;
    }

    try {
      // Call the API endpoint
      const response = await apiService.resetPassword(token, password);
      // Display success message and redirect after delay
      setMessage({ type: 'success', text: response.data.message + ' Redirecting to login...' });
      setTimeout(() => {
          navigate('/login');
      }, 3000); // 3-second delay
    } catch (error) {
      // Display error from API or a generic one
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred. Please try again or request a new link.'
      });
      console.error("Reset Password Error:", error.response || error);
      setLoading(false); // Keep form enabled on error
    }
    // No finally setLoading(false) here because we navigate away on success
  };

  return (
    <Box
      sx={{
        position: 'fixed', // Use fixed positioning
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#ebf2ffff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: 'hidden', // Prevents scrolling
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: '600px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Right Side - Reset Password Form */}
        <Box
          sx={{
            flex: { xs: 'none', md: '1 1 50%' },
            padding: { xs: '30px 20px', md: '50px 40px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#fff',
          }}
        >
          {/* Brand Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: { xs: '20px', md: '24px' },
              fontWeight: 700,
              color: '#4f46e5',
              marginBottom: '15px',
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            <ShieldIcon sx={{ marginRight: '10px', fontSize: { xs: '24px', md: '28px' } }} />
            Legaliz
          </Box>

          {/* Title Text */}
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '22px', md: '30px' },
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '5px',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Set Your New Password
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              marginBottom: '30px',
              fontSize: '16px',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Create a strong password to protect your account.
          </Typography>

          {/* Display Success or Error Messages */}
          {message && (
            <Alert
              severity={message.type}
              sx={{
                borderRadius: '12px',
                marginBottom: '20px',
                fontWeight: 600,
                background: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                color: message.type === 'error' ? '#991b1b' : '#065f46',
                border: message.type === 'error' ? '1px solid #fca5a5' : '1px solid #6ee7b7',
              }}
            >
              {message.text}
            </Alert>
          )}

          {/* Form - Only show form if success message hasn't been sent */}
          {message.type !== 'success' ? (
            <Box component="form" onSubmit={handleResetPassword} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'} // Toggle type
                id="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                helperText="Min. 8 characters, with uppercase, lowercase, and a number or special character."
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  marginBottom: '20px',
                  '& .MuiOutlinedInput-root': {
                    // height: '56px', // Removed fixed height to allow helper text
                    borderRadius: '12px',
                    fontSize: '16px',
                    '& fieldset': {
                      borderWidth: '2px',
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#4f46e5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4f46e5',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'} // Toggle type
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  marginBottom: '20px',
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    '& fieldset': {
                      borderWidth: '2px',
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#4f46e5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4f46e5',
                    },
                  },
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  height: { xs: '48px', md: '56px' },
                  fontSize: { xs: '15px', md: '16px' },
                  fontWeight: 600,
                  marginBottom: '30px',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Reset Password'}
              </Button>
            </Box>
          ) : (
            // Show a link back to login after success
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: '#6b7280',
                marginTop: '30px', // Add space after success alert
              }}
            >
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#4f46e5',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    color: '#3730a3',
                    textDecoration: 'underline',
                  },
                }}
              >
                Back to Sign In
              </Link>
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;

