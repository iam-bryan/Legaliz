import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Grid, Card, CardContent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../api/apiService';

const ClientCreateEditPage = () => {
  const { id } = useParams(); // Get the client ID from the URL if editing (/clients/edit/:id)
  const navigate = useNavigate();
  const isEditMode = Boolean(id); // True if an ID is present in the URL

  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  // Optional: If creating a client should also create a linked user account (more complex)
  // const [password, setPassword] = useState('');

  // State for loading and errors
  const [loading, setLoading] = useState(false); // For form submission
  const [pageLoading, setPageLoading] = useState(isEditMode); // For fetching data in edit mode
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // For success messages

  // Fetch client details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setPageLoading(true);
      setError('');
      apiService.getClientDetails(id)
        .then(res => {
          const client = res.data;
          setName(client.name || '');
          setEmail(client.email || '');
          setContact(client.contact || '');
          setAddress(client.address || '');
          setPageLoading(false);
        })
        .catch(err => {
          setError('Failed to load client details for editing.');
          console.error("Fetch Client Details Error:", err.response || err);
          setPageLoading(false);
        });
    }
  }, [id, isEditMode]); // Rerun if ID changes (though unlikely on the same page)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic Validation
    if (!name || !email) {
      setError("Client Name and Email are required.");
      setLoading(false);
      return;
    }

    const clientData = {
      id: isEditMode ? id : undefined, // Include ID only when updating
      name,
      email,
      contact,
      address,
      // user_id: null // Set user_id if linking to an existing user is required
    };

    try {
      const apiCall = isEditMode
        ? apiService.updateClient(clientData)
        : apiService.createClient(clientData);

      await apiCall;
      setSuccess(`Client successfully ${isEditMode ? 'updated' : 'created'}!`);
      setLoading(false);
      // Redirect back to client list after a short delay
      setTimeout(() => navigate('/clients'), 1500);

    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} client.`;
      setError(errMsg);
      console.error("Save Client Error:", err.response || err);
    }
  };

  // Show loading spinner while fetching data for edit mode
  if (pageLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        {isEditMode ? `Edit Client: ${name || ''}` : 'Add New Client'}
      </Typography>

      {/* Show general page load error */}
      {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* Show success message */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField required fullWidth id="name" label="Client Name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} margin="normal"/>
              </Grid>
              <Grid item xs={12}>
                <TextField required fullWidth id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} margin="normal"/>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth id="contact" label="Contact Number (Optional)" value={contact} onChange={(e) => setContact(e.target.value)} disabled={loading} margin="normal"/>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth id="address" label="Address (Optional)" value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} margin="normal"/>
              </Grid>
              {/* Add fields for creating a linked user account if needed */}
              {/* {!isEditMode && (
                <Grid item xs={12}>
                  <TextField fullWidth label="Set Password for User Account (Optional)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} margin="normal"/>
                </Grid>
              )} */}
            </Grid>

            {/* Display specific submission errors */}
            {error && loading && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create Client')}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/clients')} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientCreateEditPage;