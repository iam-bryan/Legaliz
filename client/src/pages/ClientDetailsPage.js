import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Alert, Button, Card, CardContent, Grid, Divider,
    List, ListItem, ListItemText, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import authService from '../api/authService'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ClientDetailsPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [associatedCases, setAssociatedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = authService.getCurrentUser(); 
  const canEdit = currentUser && currentUser.role !== 'client'; // <-- Define edit perm

  const fetchData = useCallback(() => {
      setLoading(true);
      setError('');
      Promise.all([
          apiService.getClientDetails(id),
          apiService.getCasesForClient(id) 
      ])
      .then(([clientResponse, casesResponse]) => {
          setClient(clientResponse.data);
          setAssociatedCases(casesResponse.data.records || []);
      })
      .catch(err => {
          setError('Failed to fetch client details or associated cases.');
          console.error("Fetch Client Data Error:", err.response || err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this client?")) return;
      setLoading(true);
      setError('');
      try {
          await apiService.deleteClient(id);
          navigate('/clients');
      } catch(err) {
          setError(err.response?.data?.message || "Failed to delete client.");
          setLoading(false);
          console.error("Delete Client Error:", err.response || err);
      }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!client) {
    return <Alert severity="warning">Client not found.</Alert>;
  }

  const getStatusChipColor = (status) => {
    switch (status) { case 'open': return 'success'; case 'in_progress': return 'warning'; case 'closed': return 'error'; default: return 'default'; }
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {client.name}
        </Typography>
        {/* --- MODIFIED: Show button based on role --- */}
        {canEdit && (
          <Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/clients/edit/${id}`)}
              sx={{ mr: 1 }}
            >
              Edit Client
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Client
            </Button>
          </Box>
        )}
      </Box>

      <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Contact Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">Email:</Typography>
              <Typography>{client.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">Phone:</Typography>
              <Typography>{client.contact || 'N/A'}</Typography>
            </Grid>
             <Grid item xs={12}>
              <Typography color="text.secondary">Address:</Typography>
              <Typography>{client.address || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="text.secondary">Client Since:</Typography>
              <Typography>{new Date(client.created_at).toLocaleDateString()}</Typography>
            </Grid>
          </Grid>

          {currentUser?.role !== 'admin' && (
            <>
              <Divider sx={{ my: 3 }}/>

              <Typography variant="h6" gutterBottom>Associated Cases</Typography>
              <List dense>
                {associatedCases.length > 0 ? associatedCases.map(c => (
                    <ListItem
                        key={c.id}
                        button
                        onClick={() => navigate(`/cases/${c.id}`)} 
                        divider
                        secondaryAction={
                            <Chip label={c.status} color={getStatusChipColor(c.status)} size="small"/>
                        }
                    >
                        <ListItemText
                            primary={c.title}
                            secondary={
                                (currentUser?.role === 'partner' || currentUser?.role === 'lawyer')
                                ? `Attorney: ${c.lawyer_name || 'Unassigned'}` 
                                : null 
                            }
                        />
                    </ListItem>
                )) : (
                    <ListItem>
                        <ListItemText primary="No cases associated with this client." />
                    </ListItem>
                )}
              </List>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientDetailsPage;