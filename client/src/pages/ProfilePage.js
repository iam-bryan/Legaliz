import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert,
  TextField, Grid, Card, CardContent, CardHeader, Button, Avatar, IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiService from '../api/apiService';
import authService from '../api/authService';
import { useNavigate } from 'react-router-dom';

const FULL_PROJECT_URL = (process.env.REACT_APP_API_URL || '').replace('/api', '');

const ProfilePage = () => {
  const navigate = useNavigate();
  const initialUser = authService.getCurrentUser() || {};

  const [firstName, setFirstName] = useState(initialUser.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(initialUser.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(initialUser.email || '');
  const [role, setRole] = useState(initialUser.role || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewPicture, setPreviewPicture] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Capitalize first letter of role
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getMyProfile(),
      apiService.getProfilePicture()
    ])
      .then(([profileResponse, pictureResponse]) => {
        const profile = profileResponse.data;
        if (profile) {
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setEmail(profile.email || '');
          setRole(profile.role || '');
        } else {
          setError('Could not load profile data.');
        }
        
        // Set profile picture if exists
        if (pictureResponse.data.has_picture) {
          setProfilePicture(FULL_PROJECT_URL + pictureResponse.data.file_path);
        }
        
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load profile details.');
        console.error("Fetch Profile Error:", err.response || err);
        setLoading(false);
      });
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5000000) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPicture(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload immediately
      handleUploadPicture(file);
    }
  };

  const handleUploadPicture = async (file) => {
    setUploading(true);
    setError('');
    setUploadSuccess('');
    
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    try {
      const response = await apiService.uploadProfilePicture(formData);
      setProfilePicture(FULL_PROJECT_URL + response.data.file_path);
      setPreviewPicture(null);
      setUploadSuccess('Profile picture updated successfully!');
      
      // Notify Header to refresh
      window.dispatchEvent(new Event('profilePictureUpdated'));
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture');
      setPreviewPicture(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!profilePicture) return;
    
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }
    
    setUploading(true);
    setError('');
    setUploadSuccess('');
    
    try {
      await apiService.removeProfilePicture();
      setProfilePicture(null);
      setPreviewPicture(null);
      setUploadSuccess('Profile picture removed successfully!');
      
      // Notify Header to refresh
      window.dispatchEvent(new Event('profilePictureUpdated'));
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }} aria-label="back to dashboard">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          My Profile
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {uploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>{uploadSuccess}</Alert>}

      {/* Profile Picture Card */}
      <Card sx={{ borderRadius: '12px', boxShadow: 3, mb: 3 }}>
        <CardHeader title="Profile Picture" />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={previewPicture || profilePicture || undefined}
              sx={{ 
                width: 120, 
                height: 120,
                fontSize: '3rem',
                bgcolor: 'primary.main'
              }}
            >
              {!profilePicture && !previewPicture && `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`}
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a profile picture. JPG, PNG, or GIF. Max 5MB.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <label htmlFor="profile-picture-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Picture'}
                  </Button>
                </label>
                {profilePicture && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemovePicture}
                    disabled={uploading}
                  >
                    Remove Picture
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardHeader title="Account Details" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="firstName"
                label="First Name"
                value={firstName}
                InputProps={{ readOnly: true }}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lastName"
                label="Last Name"
                value={lastName}
                InputProps={{ readOnly: true }}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                label="Email Address"
                type="email"
                value={email}
                InputProps={{ readOnly: true }}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="role"
                label="Role"
                value={capitalize(role)}
                InputProps={{ readOnly: true }}
                variant="outlined"
                margin="normal"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
