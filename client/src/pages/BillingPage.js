import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, Select, MenuItem, InputLabel, FormControl,
  Card, CardContent, List, ListItem, ListItemText, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import apiService from '../api/apiService';
import authService from '../api/authService'; // <-- ADDED IMPORT
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import BillingFormModal from '../components/Modals/BillingFormModal';

const BillingPage = () => {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [billingRecords, setBillingRecords] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser(); // <-- GET CURRENT USER

  // --- ADDED: Define roles that can add billing ---
  const canAddBilling = currentUser && ['admin', 'partner', 'lawyer'].includes(currentUser.role);
  const canEditBilling = currentUser && currentUser.role !== 'client';

  // Fetch cases
  useEffect(() => {
    setLoadingCases(true);
    apiService.getCases()
      .then(res => setCases(res.data.records || []))
      .catch(err => setError("Failed to load cases list."))
      .finally(() => setLoadingCases(false));
  }, []);

  // Fetch billing records
  const fetchBilling = useCallback(() => {
    if (selectedCaseId) {
      setLoadingBilling(true); setError('');
      apiService.getBillingForCase(selectedCaseId)
        .then(res => setBillingRecords(res.data.records || []))
        .catch(err => setError("Failed to load billing records."))
        .finally(() => setLoadingBilling(false));
    } else {
      setBillingRecords([]);
    }
  }, [selectedCaseId]);
  useEffect(() => { fetchBilling(); }, [fetchBilling]);

  const getStatusChipColor = (status) => {
    switch (status) { case 'paid': return 'success'; case 'unpaid': return 'warning'; case 'overdue': return 'error'; default: return 'default'; }
  };

  // Add Modal Logic
  const handleOpenAddModal = () => { if (!selectedCaseId) { setError("Select case first."); return; } setIsAddModalOpen(true); };
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleSaveSuccess = () => { fetchBilling(); };

  // Edit Status Modal Logic
  const handleOpenEditModal = (record) => { setSelectedRecord(record); setNewStatus(record.status); setUpdateError(''); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedRecord(null); setIsUpdatingStatus(false); };
  const handleUpdateStatus = () => {
    if (!selectedRecord || !newStatus) return;
    setUpdateError(''); setIsUpdatingStatus(true);
    apiService.updateBillingStatus(selectedRecord.id, newStatus)
      .then(() => { handleCloseEditModal(); fetchBilling(); })
      .catch(err => { setUpdateError(err.response?.data?.message || "Update failed."); })
      .finally(() => { setIsUpdatingStatus(false); });
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }} aria-label="back to dashboard">
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Billing Management</Typography>
        </Box>
        {/* --- MODIFIED: Show button based on role --- */}
        {canAddBilling && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal} disabled={!selectedCaseId || loadingBilling || loadingCases}> Add Record </Button>
        )}
      </Box>

      {/* Case Selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="case-select-label">Select Case to View Billing</InputLabel>
        <Select labelId="case-select-label" id="case-select" value={selectedCaseId} label="Select Case to View Billing" onChange={(e) => setSelectedCaseId(e.target.value)} disabled={loadingCases}>
          <MenuItem value=""><em>Select a Case</em></MenuItem>
          {cases.map((c) => (<MenuItem key={c.id} value={c.id}>{c.title} (#{c.id})</MenuItem>))}
        </Select>
      </FormControl>

      {/* General Error Display */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Billing Records Card */}
      <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Billing Records {selectedCaseId ? `for Case #${selectedCaseId}` : ''}</Typography>
          {loadingBilling && <Box sx={{ display: 'flex', justifyContent: 'center'}}><CircularProgress size={24} /></Box>}
          {!loadingBilling && billingRecords.length === 0 && <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>{selectedCaseId ? 'No records found.' : 'Select a case to view billing records.'}</Typography>}
          {!loadingBilling && billingRecords.length > 0 && (
            <List dense>
              {billingRecords.map((record) => (
                <ListItem
                  key={record.id}
                  divider
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                       <Typography sx={{ fontWeight: 'medium', minWidth: '80px', textAlign: 'right' }}>
                         ₱{Number(record.amount).toFixed(2)}
                       </Typography>
                       <Chip label={record.status} color={getStatusChipColor(record.status)} size="small" sx={{ mx: 1.5 }}/>
                       <IconButton
                         edge="end" size="small"
                         href={`${API_BASE_URL}/billing/invoice_pdf.php?invoice_number=${record.invoice_number}`}
                         target="_blank" aria-label="view invoice pdf" sx={{ mr: 1 }} title="View Invoice PDF"
                        >
                            <PictureAsPdfIcon fontSize="small"/>
                       </IconButton>
                       {/* --- MODIFIED: Show button based on role --- */}
                       {canEditBilling && (
                         <IconButton edge="end" size="small" onClick={() => handleOpenEditModal(record)} aria-label="edit status">
                              <EditIcon fontSize="small"/>
                         </IconButton>
                       )}
                    </Box>
                  }
                >
                  <ListItemText
                    primary={record.description}
                    secondary={`Invoice #: ${record.invoice_number} | Due: ${record.due_date || 'N/A'} | Created: ${new Date(record.created_at).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add Billing Modal */}
      <BillingFormModal open={isAddModalOpen} onClose={handleCloseAddModal} onSaveSuccess={handleSaveSuccess} caseId={selectedCaseId} />

      {/* Edit Status Modal */}
       <Dialog open={isEditModalOpen} onClose={handleCloseEditModal}>
         <DialogTitle>Update Billing Status</DialogTitle>
         <DialogContent>
           {updateError && <Alert severity="error">{updateError}</Alert>}
           <Typography sx={{mb: 2}}>Inv: {selectedRecord?.invoice_number}</Typography>
           <FormControl fullWidth sx={{mt: 1}}>
             <InputLabel id="status-update-label-in-modal">Status</InputLabel>
             <Select labelId="status-update-label-in-modal" value={newStatus} label="Status" onChange={(e) => setNewStatus(e.target.value)} disabled={isUpdatingStatus}>
               <MenuItem value={'unpaid'}>Unpaid</MenuItem> <MenuItem value={'paid'}>Paid</MenuItem> <MenuItem value={'overdue'}>Overdue</MenuItem> <MenuItem value={'pending'}>Pending</MenuItem> <MenuItem value={'canceled'}>Canceled</MenuItem>
             </Select>
           </FormControl>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleCloseEditModal} disabled={isUpdatingStatus}>Cancel</Button>
           <Button onClick={handleUpdateStatus} variant="contained" disabled={isUpdatingStatus}> {isUpdatingStatus ? <CircularProgress size={24}/> : 'Update'} </Button>
         </DialogActions>
       </Dialog>
    </Box>
  );
};

export default BillingPage;