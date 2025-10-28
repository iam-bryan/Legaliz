import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import authService from '../api/authService'; // <-- ADDED IMPORT
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ClientDirectoryPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser(); // <-- GET CURRENT USER

  // --- ADDED: Define roles that can add clients ---
  const canAddClients = currentUser && ['admin', 'partner', 'lawyer'].includes(currentUser.role);

  useEffect(() => {
    setLoading(true);
    apiService.getClients()
      .then(response => {
        setClients(response.data.records || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch clients.');
        console.error("Fetch Clients Error:", err.response || err);
        setLoading(false);
      });
  }, []);

  const columns = [
    { field: 'name', headerName: 'Client Name', flex: 1.5, minWidth: 200 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { field: 'contact', headerName: 'Phone', flex: 1, minWidth: 150 },
    { field: 'address', headerName: 'Address', flex: 2, minWidth: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/clients/${params.row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }} aria-label="back to dashboard">
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Client Directory
            </Typography>
        </Box>
        {/* --- MODIFIED: Show button based on role --- */}
        {canAddClients && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/clients/new')}
          >
            Add New Client
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ height: 600, width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: 3 }}>
        <DataGrid
          rows={clients}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Box>
    </Box>
  );
};

export default ClientDirectoryPage;