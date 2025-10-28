import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import apiService from '../api/apiService';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UserFormModal from '../components/UserFormModal'; // We'll create this next

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the modal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // User to edit, null for adding

  const fetchUsers = () => {
    setLoading(true);
    setError('');
    apiService.getUsers()
      .then(response => {
        setUsers(response.data.records || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to fetch users.');
        console.error("Fetch Users Error:", err.response || err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setCurrentUser(user); // If user is null, it's an "Add New" modal
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentUser(null);
  };

  const handleSaveUser = (userData) => {
    setLoading(true); // Indicate loading state
    const apiCall = currentUser
      ? apiService.updateUser({ ...userData, id: currentUser.id })
      : apiService.createUser(userData);

    apiCall
      .then(() => {
        handleCloseModal();
        fetchUsers(); // Refresh the list
      })
      .catch(err => {
        // Error handling should ideally be inside the modal,
        // but we can show a general error here too
        setError(err.response?.data?.message || `Failed to ${currentUser ? 'update' : 'create'} user.`);
        console.error("Save User Error:", err.response || err);
        setLoading(false); // Make sure loading stops on error
      });
  };

  const handleDeleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setError('');
    apiService.deleteUser(id)
      .then(() => {
        fetchUsers(); // Refresh the list
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to delete user.');
        console.error("Delete User Error:", err.response || err);
        setLoading(false);
      });
  };


  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'first_name', headerName: 'First Name', flex: 1, minWidth: 130 },
    { field: 'last_name', headerName: 'Last Name', flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { field: 'role', headerName: 'Role', flex: 1, minWidth: 100 },
    {
        field: 'created_at',
        headerName: 'Created On',
        flex: 1,
        minWidth: 150,
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenModal(params.row)} color="primary" size="small">
            <EditIcon fontSize="small"/>
          </IconButton>
          <IconButton onClick={() => handleDeleteUser(params.row.id)} color="error" size="small">
            <DeleteIcon fontSize="small"/>
          </IconButton>
        </>
      ),
    },
  ];

  if (loading && users.length === 0) { // Show loading only on initial load
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()} // Open modal for adding
        >
          Add New User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ height: 600, width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: 3 }}>
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={loading} // Show loading overlay during refresh
        />
      </Box>

      {/* Add/Edit User Modal */}
      <UserFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={currentUser} // Pass the user data for editing, or null for adding
      />
    </Box>
  );
};

export default UserManagementPage;