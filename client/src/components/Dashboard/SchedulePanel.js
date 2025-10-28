import React from 'react';
import { Box, Typography, Divider, Card, CardHeader, CardContent, Button } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';

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

// FIX: Added startDayOffset prop and set correct minHeight default
const SchedulePanel = ({ upcomingSchedules = [], title = "Upcoming Schedule", daysToShow = 7, startDayOffset = 0, minHeight = 450 }) => {
  const navigate = useNavigate();
  const today = new Date();
  
  // Calculate start date of the range (e.g., today + offset)
  const startRange = new Date(today);
  startRange.setDate(today.getDate() + startDayOffset);
  const startRangeISO = startRange.toISOString().split('T')[0];

  // Calculate end date of the range
  const endRange = new Date(startRange);
  // FIX: daysToShow should define the *total* number of days including the start day.
  endRange.setDate(startRange.getDate() + daysToShow - 1); 
  const endRangeISO = endRange.toISOString().split('T')[0];
  
  // Need current date for 'TODAY' label check
  const actualTodayISO = today.toISOString().split('T')[0];

  const schedulesByDay = (upcomingSchedules || [])
    .filter(s => {
        const date = normalizeDate(s);
        // Filter events strictly within the calculated range
        return date && date >= startRangeISO && date <= endRangeISO;
    })
    .sort((a, b) => (a.start_date || a.start).localeCompare(b.start_date || b.start)) 
    .reduce((acc, schedule) => {
        const dateKey = normalizeDate(schedule);
        if (dateKey) {
            if (!acc[dateKey]) {
                const day = new Date(dateKey);
                acc[dateKey] = {
                    dayName: day.toLocaleDateString(undefined, { weekday: 'long' }),
                    date: dateKey,
                    events: []
                };
            }
            acc[dateKey].events.push(schedule);
        }
        return acc;
    }, {});

    const sortedDays = Object.keys(schedulesByDay).sort();
    
    // Safety check: if showing only today's schedules, this component should not be used.
    if (startDayOffset === 0 && daysToShow === 1) return null;


  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 3, height: '100%', minHeight: minHeight }}>
      <CardHeader title={title} action={
         <Button 
            size="small" 
            onClick={() => navigate('/calendar')}
            sx={{ fontWeight: 'bold' }}
         >
            Full Calendar
         </Button>
      }/>
      <CardContent sx={{ pt: 0, maxHeight: `calc(100% - 70px)`, overflowY: 'auto' }}>
        {sortedDays.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 2, fontStyle: 'italic' }}>
            No scheduled events from {startRange.toLocaleDateString()} to {endRange.toLocaleDateString()}.
          </Typography>
        ) : (
          <Box>
            {sortedDays.map((dateKey, dayIndex) => {
                const dayData = schedulesByDay[dateKey];
                const isToday = dayData.date === actualTodayISO;

                return (
                    <Box key={dateKey} sx={{ mb: 2 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            py: 0.5, 
                            borderBottom: '1px solid', 
                            borderColor: 'grey.200' 
                        }}>
                            <CalendarTodayIcon fontSize="small" color={isToday ? 'primary' : 'action'} sx={{ mr: 1 }}/>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: isToday ? 'primary.main' : 'text.primary' }}>
                                {isToday ? `TODAY - ${dayData.dayName}` : `${dayData.dayName}, ${new Date(dayData.date).toLocaleDateString()}`}
                            </Typography>
                        </Box>
                        {dayData.events.map((schedule, eventIndex) => (
                            <Box 
                                key={eventIndex} 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    p: 1, 
                                    borderLeft: `3px solid ${schedule.status === 'Completed' ? '#388E3C' : (schedule.status === 'Cancelled' ? '#D32F2F' : '#2065D1')}`,
                                    mt: 0.5, ml: 1, // Indent slightly
                                }}
                            >
                                <Box sx={{minWidth: 0, pr: 1}}>
                                    <Typography variant="body2" sx={{ lineHeight: 1.2, fontWeight: 'medium' }}>
                                        {schedule.title || schedule.event_title || 'Untitled Event'}
                                    </Typography>
                                    {schedule.case_title && (
                                        <Typography variant="caption" color="text.secondary">
                                            Case: {schedule.case_title}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: isToday ? 'primary.dark' : 'text.secondary' }}>
                                        {extractTime(schedule)}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        {dayIndex < sortedDays.length - 1 && <Divider sx={{ my: 1.5 }} />}
                    </Box>
                );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SchedulePanel;