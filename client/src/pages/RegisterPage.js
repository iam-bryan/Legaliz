import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, Link,
  Paper, IconButton, InputAdornment, Grid, CircularProgress
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HomeIcon from '@mui/icons-material/Home'; // Import HomeIcon
import PhoneIcon from '@mui/icons-material/Phone'; // Import PhoneIcon
import apiService from '../api/apiService'; // Using apiService

const RegisterPage = () => {
  // Helper function to capitalize the first letter of a string - DEFINED INSIDE COMPONENT
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [address, setAddress] = useState(''); // New state for address
  const [phoneNumber, setPhoneNumber] = useState(''); // New state for phone number
  const [message, setMessage] = useState(''); // Unified message state { type, text }
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Error timeout effect
  useEffect(() => {
    if (message.type === 'error') {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000); // 5-second timeout for errors
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Password validation function
// Password validation function
function validatePassword(pass) {
  const errors = [];
  if (pass.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(pass)) {
    errors.push('Password must contain one uppercase letter.');
  }
  if (!/[a-z]/.test(pass)) {
    errors.push('Password must contain one lowercase letter.');
  }
  if (!/[0-9]/.test(pass) && !/[^A-Za-z0-9]/.test(pass)) {
    errors.push('Password must contain one number or special character.');
  }
  return errors.join(' ');
}

const passwordErrorText = validatePassword(password);

const handleConfirmPasswordChange = (e) => {
  const value = e.target.value;
  setConfirmPassword(value);
  if (password && value !== password) {
    setPasswordError("Passwords do not match.");
  } else {
    setPasswordError('');
  }
};


  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    // --- Validation Block ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    const hasNumber = /\d/;

    // Use trimmed values for validation
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();


    if (!trimmedFirstName || trimmedFirstName.length <= 1) {
      setMessage({ type: 'error', text: 'First name must be more than one character.' });
      return;
    }

    if (!trimmedLastName || trimmedLastName.length <= 1) {
      setMessage({ type: 'error', text: 'Last name must be more than one character.' });
      return;
    }

    if (hasNumber.test(trimmedLastName)) {
      setMessage({ type: 'error', text: 'Last name cannot contain numbers.' });
      return;
    }

    if (!email || !emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (passwordErrorText) {
      setMessage({ type: 'error', text: passwordErrorText });
      return;
    }

     // --- END Validation Block ---

    setLoading(true);

    try {
      // Pass new fields to the apiService
      // Send the already capitalized values
      const response = await apiService.register(
        firstName, // Already capitalized by state update
        lastName,  // Already capitalized by state update
        email.trim(),
        password,
        address, // Send address
        phoneNumber // Send phone number
      );
      setMessage({ type: 'success', text: response.data.message + ' Redirecting to login...' });
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000); // Redirect on success
    } catch (error) {
      const resMessage =
        (error.response && error.response.data && error.response.data.message) ||
        'An error occurred. Please try again.';

      const detailedError = (error.response && error.response.data && error.response.data.error)
        ? `: ${error.response.data.error}`
        : '';

      setMessage({ type: 'error', text: resMessage + detailedError });
      setLoading(false);
    }

  };

  return (
    <Box
      sx={{
        position: 'fixed',
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
        overflow: 'auto', // Allow scrolling on small screens
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: '900px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          margin: '20px 0', // Add margin for small screens
        }}
      >
        {/* Right Side - Register Form */}
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
            Create Your Account
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
            Join us to manage your legal cases efficiently.
          </Typography>

          {/* Display Success or Error Messages */}
          {message && (
            <Alert
              severity={message.type}
              sx={{
                borderRadius: '12px',
                marginTop: '10px',
                marginBottom: '10px',
                fontWeight: 600,
                background: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                color: message.type === 'error' ? '#991b1b' : '#065f46',
                border: message.type === 'error' ? '1px solid #fca5a5' : '1px solid #6ee7b7',
              }}
            >
              {message.text}
            </Alert>
          )}

          {/* Form */}
          {message.type !== 'success' ? (
            <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={firstName}
                    // --- UPDATED onChange ---
                    onChange={(e) => setFirstName(capitalizeFirstLetter(e.target.value))}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <AccountCircleIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                    }}
                    sx={{
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 1000px #ffffff inset', // Force white background
                  WebkitTextFillColor: '#1f2937', // Set text color to match normal input
                  transition: 'background-color 5000s ease-in-out 0s', // Long transition to override
                },
                      '& .MuiOutlinedInput-root': {
                        height: '56px', borderRadius: '12px', fontSize: '16px',
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#4f46e5' },
                        '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                     // --- UPDATED onChange ---
                    onChange={(e) => setLastName(capitalizeFirstLetter(e.target.value))}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <AccountCircleIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                    }}
                    sx={{
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 1000px #ffffff inset', // Force white background
                  WebkitTextFillColor: '#1f2937', // Set text color to match normal input
                  transition: 'background-color 5000s ease-in-out 0s', // Long transition to override
                },
                      '& .MuiOutlinedInput-root': {
                        height: '56px', borderRadius: '12px', fontSize: '16px',
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#4f46e5' },
                        '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    type="email" // Ensure correct type for browser validation
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                    }}
                    sx={{
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 1000px #ffffff inset', // Force white background
                  WebkitTextFillColor: '#1f2937', // Set text color to match normal input
                  transition: 'background-color 5000s ease-in-out 0s', // Long transition to override
                },
                      '& .MuiOutlinedInput-root': {
                        height: '56px', borderRadius: '12px', fontSize: '16px',
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#4f46e5' },
                        '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                      },
                    }}
                  />
                </Grid>
                 {/* New Phone Number Field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="phoneNumber"
                    label="Phone Number (Optional)"
                    name="phoneNumber"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                    }}
                    sx={{
                '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 1000px #ffffff inset', // Force white background
                  WebkitTextFillColor: '#1f2937', // Set text color to match normal input
                  transition: 'background-color 5000s ease-in-out 0s', // Long transition to override
                },
                      '& .MuiOutlinedInput-root': {
                        height: '56px', borderRadius: '12px', fontSize: '16px',
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#4f46e5' },
                        '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                      },
                    }}
                  />
                </Grid>
                {/* New Address Field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address"
                    label="Address (Optional)"
                    name="address"
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ color: '#6b7280', marginRight: 1 }} />,
                    }}
                    sx={{
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 1000px #ffffff inset', // Force white background
                  WebkitTextFillColor: '#1f2937', // Set text color to match normal input
                  transition: 'background-color 5000s ease-in-out 0s', // Long transition to override
                },
                      '& .MuiOutlinedInput-root': {
                        height: '56px', borderRadius: '12px', fontSize: '16px',
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#4f46e5' },
                        '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                      },
                    }}
                  />
                </Grid>
 

                {/* Password */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    helperText="Uppercase, lowercase, & a number or special character (min 8)."
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
                      '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                        WebkitTextFillColor: '#1f2937',
                        transition: 'background-color 5000s ease-in-out 0s',
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '16px',
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#4f46e5' },
                        '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                      },
                    }}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={!!passwordError}
                  helperText={passwordError || 'Re-enter your password to confirm.'}
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
                      '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                        WebkitTextFillColor: '#1f2937',
                        transition: 'background-color 5000s ease-in-out 0s',
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '16px',
                        '& fieldset': { borderWidth: '2px', borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#4f46e5' },
                        '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                      },
                    }}
                  />
                </Grid>

              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  height: { xs: '48px', md: '56px' },
                  fontSize: { xs: '15px', md: '16px' },
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link component={RouterLink} to="/login" variant="body2"
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
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
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

export default RegisterPage;

