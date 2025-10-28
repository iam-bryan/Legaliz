import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService from '../api/authService';
import {
  Box, TextField, Button, Typography, Alert, Link,
  Checkbox, FormControlLabel, Paper,
  IconButton, InputAdornment // Added for eye button
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility'; // Added for eye button
import VisibilityOff from '@mui/icons-material/VisibilityOff'; // Added for eye button

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000); 

      // Cleanup function to clear timeout if component unmounts
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    authService.login(email, password).then(
      () => {
        navigate('/dashboard');
      },
      (error) => {
        const resMessage = error.response?.data?.message || error.message || error.toString();
        setError(resMessage);
        setLoading(false);
      }
    );
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
          maxWidth: '1200px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Left Side - Illustration */}
        <Box
          sx={{
            flex: { xs: 'none', md: '1 1 50%' },
            background: 'linear-gradient(135deg, #e4fffa 0%, #ebefff 100%)',
            display: { xs: 'none', md: 'flex' }, // Hide on mobile
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: '180px', md: '400px' },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              animation: 'float 4s ease-in-out infinite reverse',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
            },
          }}
        >
          <Box sx={{ textAlign: 'center', padding: 2 }}>
            <Box
              component="img"
              src="https://www.pngkey.com/png/full/214-2142812_law-logo-png-lawyer.png"
              alt="Legal Logo"
              sx={{
                width: { xs: '60%', md: '70%' },
                maxWidth: { xs: '200px', md: '350px' },
                height: 'auto',
                margin: '0 auto',
                display: 'block',
              }}
            />
          </Box>
        </Box>

        {/* Right Side - Login Form */}
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

          {/* Welcome Text */}
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
            Welcome!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              marginBottom: '10px',
              fontSize: '16px',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Please login with your email address and password.
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: '12px',
                marginBottom: '20px',
                fontWeight: 600,
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
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
                  WebkitBoxShadow: '0 0 0 1000px #ffffff inset', // Force white background
                  WebkitTextFillColor: '#1f2937', // Set text color to match normal input
                  transition: 'background-color 5000s ease-in-out 0s', // Long transition to override
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

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'} // Set type based on state
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: <LockIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                // Add the eye button
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
                )
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

            {/* Remember Me & Forgot Password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{
                      '&.Mui-checked': {
                        color: '#4f46e5',
                      },
                    }}
                  />
                }
                label="Remember Me"
                disabled={loading}
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                sx={{
                  color: '#4f46e5',
                  textDecoration: 'none',
                  fontSize: '14px',
                  '&:hover': {
                    color: '#3730a3',
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Login Button */}
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
              {loading ? 'Signing In...' : 'Login Now'}
            </Button>
          </Box>

          {/* Create Account Link */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
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
              Create Account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;

