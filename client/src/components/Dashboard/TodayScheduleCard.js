import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
 
// Helper to normalize the date (extracts YYYY-MM-DD from various formats)
const normalizeDate = (s) => {
  if (!s) return null;
  const val = s.start_date || s.start || s.date || s;
  if (!val) return null;
  try {
    const iso = String(val);
    if (iso.includes('T')) return iso.split('T')[0];
    const d = new Date(iso);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  } catch (e) {}
  return null;
};
 
// Helper to extract and format time (e.g., 08:30:00 -> 8:30 AM)
const extractTime = (s) => {
  if (!s) return '';
  const val = s.start_date || s.start || s.time || s.datetime || s.date_time || '';
  if (!val) return '';
  try {
    const iso = String(val);
    if (iso.includes('T')) {
      const t = iso.split('T')[1] || '';
      const [h, m] = t.slice(0, 5).split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
    }
    const d = new Date(iso);
    if (!isNaN(d)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return String(val);
  } catch {
    return '';
  }
};
 
 
const TodayScheduleCard = ({ upcomingSchedules = [] }) => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  // Removed dynamic day name logic: const todayDayName = today.toLocaleDateString(undefined, { weekday: 'long' });
 
  // Filter, then sort today's schedules by start time
  const todaySchedules = (upcomingSchedules || [])
    .filter(s => normalizeDate(s) === todayISO)
    .sort((a, b) => (a.start_date || a.start).localeCompare(b.start_date || b.start));
 
  return (
<Card sx={{ borderRadius: '12px', boxShadow: 3, height: '100%' }}>
<Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'grey.200' }}>
<TodayIcon sx={{ mr: 1, color: 'primary.main', fontSize: 24 }} />
<Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Today's Schedule
</Typography>
</Box>
<CardContent sx={{ maxHeight: 250, overflowY: 'auto' }}>
        {todaySchedules.length === 0 ? (
<Typography color="text.secondary" align="center" sx={{ mt: 2, fontStyle: 'italic' }}>
            No events scheduled for today.
</Typography>
        ) : (
<Box sx={{ display: 'grid', gap: 1 }}>
            {todaySchedules.map((schedule, index) => (
<Box 
                    key={index} 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between', 
                        alignItems: 'stretch',
                        p: 1, 
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        borderLeft: `4px solid ${schedule.status === 'Completed' ? '#388E3C' : (schedule.status === 'Cancelled' ? '#D32F2F' : '#2065D1')}`,
                    }}
>
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
<Typography 
                            variant="body1" 
                            sx={{fontWeight: 'medium', color: 'primary.main', fontSize: '1.1rem'}} // Increased Event Title size
>
                          {schedule.title || schedule.event_title || 'Untitled Event'}
</Typography>
<Typography 
                            variant="body1" // Increased Time size to body1
                            sx={{ fontWeight: 'bold', flexShrink: 0, ml: 1 }}
>
                            {extractTime(schedule) || 'N/A'}
</Typography>
</Box>
                    {/* DETAILS BLOCK */}
                    {(schedule.location || schedule.case_title || schedule.notes) && (
<Box sx={{ mt: 0.5 }}>
                            {schedule.location && (
<Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ display: 'block', fontSize: '0.95rem' }} // Slight increase
>
                                    Location: **{schedule.location}**
</Typography>
                            )}
                            {schedule.case_title && (
<Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ display: 'block', fontSize: '0.95rem' }} // Slight increase
>
                                    Case: **{schedule.case_title}**
</Typography>
                            )}
                            {schedule.notes && (
<Typography 
                                    variant="body2" // Increased Notes size to body2
                                    color="text.secondary" 
                                    sx={{ mt: 0.5, fontStyle: 'italic' }}
>
                                    Notes: {schedule.notes.substring(0, 80)}{schedule.notes.length > 80 ? '...' : ''}
</Typography>
                            )}
</Box>
                    )}
                    {/* END DETAILS BLOCK */}
</Box>
            ))}
</Box>
        )}
</CardContent>
</Card>
  );
};
 
export default TodayScheduleCard;