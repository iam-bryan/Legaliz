import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, Alert, CircularProgress, Box
} from '@mui/material';
import apiService from '../../api/apiService'; // Adjust path if needed

// --- Helper to get nearest 30-min interval ---
const getNearestTimeSlot = (isoOrDate) => {
    if (!isoOrDate) return '';
    const date = (isoOrDate instanceof Date) ? isoOrDate : new Date(isoOrDate);
    if (isNaN(date.getTime())) return ''; // Invalid date input
    const minutes = date.getMinutes();
    
    const roundedMinutes = minutes < 30 ? '00' : '30'; 
    const hours = String(date.getHours()).padStart(2, '0');
    return `${hours}:${roundedMinutes}`;
};

// --- Generate time options (12-hour AM/PM format, 30-min increments) ---
const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
      times.push({ value, label });
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

const ScheduleEventModal = ({ open, onClose, onSaveSuccess, eventInfo, caseId }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(eventInfo?.id);

  useEffect(() => {
    if (open) {
      if (eventInfo) {
        const startStr = eventInfo.startStr;
        const endStr = eventInfo.endStr;
        
        setTitle(eventInfo.title || '');
        setDate(startStr ? startStr.split('T')[0] : '');
        setStartTime(getNearestTimeSlot(startStr));
        setEndTime(getNearestTimeSlot(endStr));
        setLocation(eventInfo.extendedProps?.location || '');
        setNotes(eventInfo.extendedProps?.notes || '');
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const defaultDate = `${year}-${month}-${day}`;
        const defaultTime = getNearestTimeSlot(now); 

        setTitle('');
        setDate(defaultDate);
        setStartTime(defaultTime);
        setEndTime('');
        setLocation('');
        setNotes('');
      }
      setError('');
    }
  }, [eventInfo, open]);

  useEffect(() => {
    if (!startTime || endTime) return; 

    const [h, m] = startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + 30; 
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    
  }, [startTime, endTime]);

  const handleSubmit = async () => {
    setError('');
    // --- MODIFIED: Removed !caseId from validation ---
    if (!title || !date || !startTime) {
      setError("Event Title, Date, and Start Time are required.");
      return;
    }
    setLoading(true);
    const start = `${date}T${startTime}:00`; 
    const end = endTime ? `${date}T${endTime}:00` : null; 

    const eventData = {
      id: eventInfo?.id,
      event_title: title,
      start_date: start,
      end_date: end,
      // --- MODIFIED: Send caseId or null ---
      case_id: caseId || null,
      location,
      notes,
    };

    try {
      const apiCall = isEditMode
        ? apiService.updateScheduleEvent(eventData)
        : apiService.createScheduleEvent(eventData);
      await apiCall;
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event.`);
      console.error("Save Event Error in Modal:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventInfo?.id || !window.confirm("Are you sure you want to delete this event?")) return;
    setLoading(true);
    setError('');
    try {
      await apiService.deleteScheduleEvent(eventInfo.id);
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Schedule Event' : 'Add New Schedule Event'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required fullWidth
                label="Event Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                margin="normal"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required fullWidth
                    label="Event Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    margin="normal"
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select required fullWidth
                    label="Start Time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    margin="normal"
                    disabled={loading}
                  >
                    {startTime === '' && <MenuItem value="" disabled><em>Select time</em></MenuItem>}
                    {timeOptions.map(time => (
                      <MenuItem key={`start-${time.value}`} value={time.value}>{time.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select fullWidth
                    label="End Time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    margin="normal"
                    disabled={loading}
                  >
                    <MenuItem value=""><em>None</em></MenuItem> 
                    {timeOptions.map(time => (
                      <MenuItem key={`end-${time.value}`} value={time.value}>{time.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location (Optional)"
                value={location}
                onChange={e => setLocation(e.target.value)}
                margin="normal"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                margin="normal"
                disabled={loading}
              />
            </Grid>
            
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        {isEditMode ? (
          <Button onClick={handleDelete} color="error" disabled={loading}>Delete Event</Button>
        ) : <Box />}
        <Box>
          <Button onClick={onClose} disabled={loading} sx={{ mr: 1 }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'Save Changes' : 'Create Event')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleEventModal;