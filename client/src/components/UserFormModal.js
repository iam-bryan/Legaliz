import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, MenuItem, Alert, CircularProgress, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

const UserFormModal = ({ open, onClose, onSave, user }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('client');
  const [lawyerType, setLawyerType] = useState('');
  const [caseTypes, setCaseTypes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = Boolean(user);

  // Fetch case types from backend
  useEffect(() => {
    axios.get('http://localhost/Syntaxxed_Legaliz/api/case_types/read.php')
      .then(response => {
        setCaseTypes(response.data.records || []);
      })
      .catch(err => {
        console.error("Failed to fetch case types:", err);
      });
  }, []);

  // Pre-fill user info
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setRole(user.role || 'client');
      setLawyerType(user.lawyerType || '');
      setPassword('');
      setConfirmPassword('');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('client');
      setLawyerType('');
    }
    setError('');
  }, [user, open]);

  const handleSubmit = async () => {
    setError('');
    if (!firstName || !email || (!isEditMode && !password) || !role) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!isEditMode && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      lawyer_type: role === 'lawyer' ? lawyerType : null
    };
    if (!isEditMode) userData.password = password;

    try {
      setLoading(true);
      await onSave(userData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent dividers sx={{ mt: 1}}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField required fullWidth label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField required fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </Grid>

          {!isEditMode && (
            <>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                    InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField select required fullWidth label="Role" value={role} onChange={e => setRole(e.target.value)}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="partner">Partner</MenuItem>
              <MenuItem value="lawyer">Lawyer</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="client">Client</MenuItem>
            </TextField>
          </Grid>

          {/* Lawyer Type dropdown (dynamic from DB) */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Lawyer Type"
              value={lawyerType}
              onChange={e => setLawyerType(e.target.value)}
              disabled={role !== 'lawyer'}
              helperText={role === 'lawyer' ? '' : 'Available only for Lawyers'}
            >
              {caseTypes.map(ct => (
                <MenuItem key={ct.id} value={ct.name}>{ct.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create User')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
