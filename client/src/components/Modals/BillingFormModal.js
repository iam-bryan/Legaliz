import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Alert, CircularProgress, Box, InputAdornment
} from '@mui/material';
import apiService from '../../api/apiService'; // Adjust path if needed

const BillingFormModal = ({ open, onClose, onSaveSuccess, caseId }) => {
  // State for form fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(''); // Store as YYYY-MM-DD for date input

  // State for loading and errors within the modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setDescription('');
      setAmount('');
      setDueDate('');
      setError('');
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    setError('');
    if (!description || !amount || !caseId) {
      setError("Description and Amount are required.");
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    setLoading(true);
    const billingData = {
      case_id: caseId,
      description: description,
      amount: parseFloat(amount),
      due_date: dueDate || null, // Send null if date is not set
    };

    try {
      // Ensure createBillingRecord exists and is correctly called
      await apiService.createBillingRecord(billingData);
      onSaveSuccess(); // Call the success callback passed from parent
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.response?.data?.message || `Failed to create billing record.`);
      console.error("Save Billing Error in Modal:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Billing Record for Case #{caseId}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                 <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        label="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        margin="normal"
                        disabled={loading}
                        multiline
                        rows={3}
                     />
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Amount"
                        type="number"
                        InputProps={{
                           startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                           inputProps: { min: 0.01, step: 0.01 } // Basic validation
                        }}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        margin="normal"
                        disabled={loading}
                    />
                 </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Due Date (Optional)"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        margin="normal"
                        disabled={loading}
                    />
                 </Grid>
            </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
         <Button onClick={onClose} disabled={loading}>Cancel</Button>
         <Button onClick={handleSubmit} variant="contained" disabled={loading}>
           {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Record'}
         </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillingFormModal;