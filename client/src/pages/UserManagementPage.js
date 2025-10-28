import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Button, IconButton, Paper } from '@mui/material';
import apiService from '../api/apiService';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UserFormModal from '../components/UserFormModal';
 
const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
 
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
    setCurrentUser(user);
    setModalOpen(true);
  };
 
  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentUser(null);
  };
 
  const handleSaveUser = (userData) => {
    setLoading(true);
    const apiCall = currentUser
      ? apiService.updateUser({ ...userData, id: currentUser.id })
      : apiService.createUser(userData);
 
    apiCall
      .then(() => {
        handleCloseModal();
        fetchUsers();
      })
      .catch(err => {
        setError(err.response?.data?.message || `Failed to ${currentUser ? 'update' : 'create'} user.`);
        console.error("Save User Error:", err.response || err);
        setLoading(false);
      });
  };
 
  const handleDeleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setError('');
    apiService.deleteUser(id)
      .then(() => {
        fetchUsers();
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to delete user.');
        console.error("Delete User Error:", err.response || err);
        setLoading(false);
      });
  };
 
  const getAvatarColor = (role) => {
    const colors = {
      admin: '#dc2626',
      partner: '#667eea',
      lawyer: '#2563eb',
      staff: '#059669',
      client: '#d97706'
    };
    return colors[role?.toLowerCase()] || '#6b7280';
  };
 
  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    return `${first}${last}` || 'U';
  };
 
  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
 
  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>
            User Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Add New User
        </Button>
      </Box>
 
      {/* Error Alert */}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}
 
      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}
      >
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  User
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Role
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Account Creation
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    {/* User Info with Avatar */}
                    <td style={{ padding: '16px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: getAvatarColor(user.role),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            flexShrink: 0
                          }}
                        >
                          {getInitials(user.first_name, user.last_name)}
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#374151',
                              fontSize: '0.875rem'
                            }}
                          >
                            {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                          
                            {/* Lawyer types */}
                            {user.specializations && user.specializations.length > 0 && (
                              <div style={{ fontSize: '0.7rem', color: '#555' }}>
                                {user.specializations.join(', ')}
                              </div>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </td>
 
                    {/* Email */}
                    <td style={{
                      padding: '16px',
                      color: '#374151',
                      fontSize: '0.875rem'
                    }}>
                      {user.email}
                    </td>
 
                  {/* Role + Specializations */}
                  <td style={{ padding: '16px' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        backgroundColor: `${getAvatarColor(user.role)}20`,
                        color: getAvatarColor(user.role),
                        marginBottom: '4px'
                      }}
                    >
                      {user.role}
                    </Box>
                  </td>


                    {/* Account Creation */}
                    <td style={{
                      padding: '16px',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
 
                    {/* Actions */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                          onClick={() => handleOpenModal(user)}
                          size="small"
                          sx={{
                            color: '#0054fbff',
                            '&:hover': {
                              color: '#2563eb',
                              backgroundColor: '#dbeafe'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteUser(user.id)}
                          size="small"
                          sx={{
                            color: '#fc0000ff',
                            '&:hover': {
                              color: '#dc2626',
                              backgroundColor: '#fee2e2'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
 
      {/* Add/Edit User Modal */}
      <UserFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={currentUser}
      />
    </Box>
  );
};
 
export default UserManagementPage;