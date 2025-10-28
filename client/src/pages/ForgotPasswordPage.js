import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, Link,
  Paper, CircularProgress
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import EmailIcon from '@mui/icons-material/Email';
import apiService from '../api/apiService'; // Make sure this path is correct

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // To show success/error messages
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Clear previous messages

    try {
      // Call the API endpoint
      const response = await apiService.requestPasswordReset(email);
      // Display the generic success message from the API
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      // Display error from API or a generic one
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred. Please try again.'
      });
      console.error("Request Reset Error:", error.response || error);
    } finally {
      setLoading(false);
    }
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

        {/* Right Side - Forgot Password Form */}
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
            Forgot Password?
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
            Enter your email and we'll send a reset link (if an account exists).
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

          {/* Form - Only show form if a success message hasn't been sent */}
          {!message.type || message.type === 'error' ? (
            <Box component="form" onSubmit={handleRequestReset} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                }}
                sx={{
                  marginBottom: '20px',
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                    WebkitTextFillColor: '#1f2937',
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
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
                disabled={loading || !email}
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
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Reset Link'}
              </Button>
            </Box>
          ) : null}

          {/* Back to Login Link */}
          {/* THIS IS THE FIXED BLOCK */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Remember your password?{' '}
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
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;

