import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem,
  Card, FormControl, InputLabel, Select, CardContent,
  List, ListItem, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import apiService from '../api/apiService';
import authService from '../api/authService'; // <-- ADDED AUTHSERVICE
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Notes';

// --- UPDATED: Helper function to generate time options ---
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = String(hour).padStart(2, '0');
      const formattedMinute = String(minute).padStart(2, '0');
      const value = `${formattedHour}:${formattedMinute}`;
      const hour12 = hour % 12 || 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${formattedMinute} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

// --- Helper to get nearest 30-min interval (no changes) ---
const getNearestTimeSlot = (isoOrDate) => {
    if (!isoOrDate) return '';
    const date = (isoOrDate instanceof Date) ? isoOrDate : new Date(isoOrDate);
    if (isNaN(date.getTime())) return '';
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? '00' : '30';
    const hours = String(date.getHours()).padStart(2, '0');
    return `${hours}:${roundedMinutes}`;
};

// --- Legend Component (no changes) ---
const CalendarLegend = () => {
  const legendItems = [
    { label: 'Upcoming', color: '#60a5fa' },
    { label: 'Today', color: '#facc15' },
    { label: 'Completed', color: '#4ade80' },
    { label: 'Cancelled', color: '#9ca3af' }
  ];
  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 3, mb: 3 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {legendItems.map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '4px', backgroundColor: item.color, border: '1px solid rgba(0,0,0,0.1)' }} />
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};


const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const calendarRef = useRef(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); 

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newEventCaseId, setNewEventCaseId] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [cases, setCases] = useState([]);
  
  // --- (1) GET CURRENT USER AND DEFINE PERMISSIONS ---
  const currentUser = authService.getCurrentUser();
  const canAddEditEvents = currentUser && currentUser.role !== 'client';

  useEffect(() => {
    // Only fetch cases if user is not a client (since they can't link them)
    // Or just fetch all, in case a non-client linked one and client is viewing
    apiService.getCases().then(res => setCases(res.data.records || [])).catch(console.error);
  }, []);

  const handleDatesSet = (dateInfo) => {
    setLoading(true);
    setError('');
    const startStr = dateInfo.startStr.split('T')[0];
    const endStr = dateInfo.endStr.split('T')[0];
    apiService.getSchedules(startStr, endStr)
      .then(response => setEvents(response.data || []))
      .catch(err => {
        setError('Failed to fetch schedule events.');
        console.error("Fetch Schedule Error:", err.response || err);
      })
      .finally(() => setLoading(false));
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event); 
    setIsViewModalOpen(true); 
  };

  const handleDateSelect = (selectInfo) => {
    // --- (2) CHECK PERMISSION BEFORE OPENING MODAL ---
    if (!canAddEditEvents) return;

    setSelectedEvent(null); 
    setNewEventTitle('');
    const now = new Date(selectInfo.startStr);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;
    const defaultTime = getNearestTimeSlot(now.toISOString());
    
    setNewDate(defaultDate);
    setNewStartTime(defaultTime);
    setNewEndTime('');
    setNewEventCaseId('');
    setNewEventLocation('');
    setNewEventNotes('');
    
    setIsEditModalOpen(true); 
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setError('');
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setError('');
  };

  const handleOpenEditModal = () => {
    // This check is redundant since button is hidden, but good for safety
    if (!canAddEditEvents || !selectedEvent) return;

    setNewEventTitle(selectedEvent.title);
    setNewDate(selectedEvent.startStr ? selectedEvent.startStr.split('T')[0] : '');
    setNewStartTime(getNearestTimeSlot(selectedEvent.startStr));
    setNewEndTime(selectedEvent.endStr ? getNearestTimeSlot(selectedEvent.endStr) : '');
    setNewEventCaseId(selectedEvent.extendedProps?.case_id || '');
    setNewEventLocation(selectedEvent.extendedProps?.location || '');
    setNewEventNotes(selectedEvent.extendedProps?.notes || '');
    
    setIsViewModalOpen(false); 
    setIsEditModalOpen(true); 
  };

  const handleSaveEvent = () => {
    setError('');
    if (!newEventTitle || !newDate || !newStartTime) {
        setError("Please fill in Title, Event Date, and Start Time.");
        return;
    }
    const startDateTime = `${newDate}T${newStartTime}:00`;
    const endDateTime = newEndTime ? `${newDate}T${newEndTime}:00` : null;
    if (endDateTime && new Date(endDateTime) <= new Date(startDateTime)) {
        setError("End time must be after start time.");
        return;
    }
    const eventData = {
        id: selectedEvent?.id,
        event_title: newEventTitle,
        start_date: startDateTime,
        end_date: endDateTime,
        case_id: newEventCaseId || null,
        location: newEventLocation,
        notes: newEventNotes,
    };
    const apiCall = selectedEvent
      ? apiService.updateScheduleEvent(eventData)
      : apiService.createScheduleEvent(eventData);
    apiCall.then(() => {
        setIsEditModalOpen(false);
        if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
        }
    }).catch(err => {
        const errMsg = err.response?.data?.message || (selectedEvent ? "Failed to update event." : "Failed to create event.");
        setError(errMsg);
        console.error("Save Event Error:", err.response || err);
    });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent || !window.confirm("Are you sure you want to delete this event?")) return;
    apiService.deleteScheduleEvent(selectedEvent.id)
    .then(() => {
        setIsEditModalOpen(false); 
        setIsViewModalOpen(false); 
        if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
        }
    }).catch(err => {
        const errMsg = err.response?.data?.message || "Failed to delete event.";
        setError(errMsg);
        console.error("Delete Event Error:", err.response || err);
    });
  };

  const handleEventDidMount = (info) => {
    const status = info.event.extendedProps?.status;
    if (status) {
      info.el.classList.add(`event-${status.toLowerCase()}`);
    }
  };
  
  const formatViewDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const formatViewTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Calendar & Schedule
        </Typography>
        {/* --- (3) HIDE "ADD EVENT" BUTTON FOR CLIENTS --- */}
        {canAddEditEvents && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleDateSelect({ startStr: new Date().toISOString(), endStr: new Date().toISOString() })}>
              Add Event
          </Button>
        )}
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress size={24} sx={{ mb: 2 }}/>}
      <CalendarLegend />

      <Box sx={{
        '& .fc-event': { /* ... */ },
        '& .fc-event-title': { /* ... */ },
        '& .fc-daygrid-event .fc-event-main': { /* ... */ },
        '& .fc-daygrid-event .fc-event-time': { /* ... */ },
        '& .fc-timegrid-event .fc-event-main': { /* ... */ },
        '& .fc-list-event-title': { /* ... */ },
        '& .event-upcoming': { backgroundColor: '#60a5fa', borderColor: '#60a5fa', color: '#fff' },
        '& .event-today': { backgroundColor: '#facc15', borderColor: '#facc15', color: '#1f2937' },
        '& .event-completed': { backgroundColor: '#4ade80', borderColor: '#4ade80', color: '#fff' },
        '& .event-cancelled': { backgroundColor: '#9ca3af', borderColor: '#9ca3af', color: '#fff', textDecoration: 'line-through' },
      }}>
        <Card sx={{ borderRadius: '12px', boxShadow: 3, p: 2 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
            initialView="dayGridMonth"
            // --- (4) DISABLE DRAG/DROP AND DATE SELECTION FOR CLIENTS ---
            editable={canAddEditEvents}
            selectable={canAddEditEvents} 
            select={handleDateSelect} // Already checks permission, but 'selectable' handles the UI
            // ---
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            datesSet={handleDatesSet}
            eventClick={handleEventClick} // Clicking to view is still allowed
            height="70vh"
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            eventDidMount={handleEventDidMount}
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              list: 'List'
            }}
          />
        </Card>
      </Box>

      {/* --- ADD/EDIT Modal (No changes needed, only opens if canAddEditEvents is true) --- */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2} sx={{ mt: 1 }}>
                 <Grid item xs={12}>
                    <TextField required fullWidth label="Event Title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} disabled={loading} />
                 </Grid>
                 
                 <Grid item xs={12} sm={4}>
                    <TextField required fullWidth label="Event Date" type="date" InputLabelProps={{ shrink: true }} value={newDate} onChange={e => setNewDate(e.target.value)} disabled={loading} />
                 </Grid>
                 <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required disabled={loading}>
                      <InputLabel id="start-time-select-label">Start Time</InputLabel>
                      <Select labelId="start-time-select-label" value={newStartTime} label="Start Time" onChange={e => setNewStartTime(e.target.value)} >
                        {newStartTime === '' && <MenuItem value="" disabled><em>Select time</em></MenuItem>}
                        {timeOptions.map(time => (
                          <MenuItem key={`start-${time.value}`} value={time.value}>{time.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                 </Grid>
                 <Grid item xs={12} sm={4}>
                    <FormControl fullWidth disabled={loading}>
                      <InputLabel id="end-time-select-label">End Time</InputLabel>
                      <Select labelId="end-time-select-label" value={newEndTime} label="End Time" onChange={e => setNewEndTime(e.target.value)} >
                         <MenuItem value=""><em>None</em></MenuItem>
                        {timeOptions.map(time => (
                          <MenuItem key={`end-${time.value}`} value={time.value}>{time.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                 </Grid>
                 
                 <Grid item xs={12}>
                     <TextField
                        select
                        fullWidth
                        label="Related Case (Optional)"
                        value={newEventCaseId}
                        onChange={e => setNewEventCaseId(e.target.value)}
                        disabled={loading}
                     >
                         <MenuItem value=""><em>None (General Event)</em></MenuItem>
                         {cases.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                     </TextField>
                 </Grid>
                 <Grid item xs={12}>
                    <TextField fullWidth label="Location (Optional)" value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} disabled={loading} />
                 </Grid>
                 <Grid item xs={12}>
                    <TextField fullWidth label="Notes (Optional)" multiline rows={3} value={newEventNotes} onChange={e => setNewEventNotes(e.target.value)} disabled={loading} />
                 </Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
             {selectedEvent && (
                <Button onClick={handleDeleteEvent} color="error" disabled={loading}>Delete Event</Button>
             )}
             <Box>
                <Button onClick={handleCloseEditModal} sx={{ mr: 1 }} disabled={loading}>Cancel</Button>
                <Button onClick={handleSaveEvent} variant="contained" disabled={loading}>{selectedEvent ? 'Save Changes' : 'Create Event'}</Button>
             </Box>
        </DialogActions>
      </Dialog>

      {/* --- VIEW Details Modal --- */}
      {selectedEvent && (
        <Dialog open={isViewModalOpen} onClose={handleCloseViewModal} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedEvent.title}</DialogTitle>
          <DialogContent>
            <List>
              <ListItem>
                <ListItemIcon><EventIcon /></ListItemIcon>
                <ListItemText primary="Date" secondary={formatViewDate(selectedEvent.startStr)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                <ListItemText primary="Time" secondary={
                  selectedEvent.endStr 
                  ? `${formatViewTime(selectedEvent.startStr)} - ${formatViewTime(selectedEvent.endStr)}`
                  : formatViewTime(selectedEvent.startStr)
                } />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon><WorkIcon /></ListItemIcon>
                <ListItemText 
                    primary="Case" 
                    secondary={
                        selectedEvent.extendedProps?.case_id 
                        ? (cases.find(c => String(c.id) === String(selectedEvent.extendedProps.case_id))?.title || 'Unknown Case')
                        : 'N/A'
                    } 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><LocationOnIcon /></ListItemIcon>
                <ListItemText primary="Location" secondary={selectedEvent.extendedProps?.location || 'N/A'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><NotesIcon /></ListItemIcon>
                <ListItemText 
                    primary="Notes" 
                    secondary={selectedEvent.extendedProps?.notes || 'No notes'} 
                    secondaryTypographyProps={{ style: { whiteSpace: 'pre-wrap' } }}
                />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            {/* --- (5) HIDE "EDIT" BUTTON FOR CLIENTS --- */}
            {canAddEditEvents ? (
              <Button 
                  onClick={handleOpenEditModal} 
                  variant="contained" 
                  startIcon={<EditIcon />}
                >
                  Edit
              </Button>
            ) : (
              <Box /> // Empty box to keep "Close" button on the right
            )}
            <Button onClick={handleCloseViewModal}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

    </Box>
  );
};

export default CalendarPage;