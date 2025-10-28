import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import TodayScheduleCard from './TodayScheduleCard'; 
import SchedulePanel from './SchedulePanel';
import PendingCases from './PendingCases'; 

const StaffDashboard = ({ upcomingSchedules = [], cases = [] }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Staff Dashboard</Typography>

      <Grid container spacing={3}>
        
        {/* LEFT COLUMN: Next 6 Days Schedule */}
        <Grid item xs={12} md={6}>
            <SchedulePanel 
                upcomingSchedules={upcomingSchedules} 
                title="This Week's Schedule" 
                daysToShow={6} 
                startDayOffset={1} // Start from tomorrow
                minHeight={450} 
            />
        </Grid>

        {/* RIGHT COLUMN: Stacked Today's Schedule and Actionable Insights */}
        <Grid item xs={12} md={6}>
            
            {/* ROW 1: Today's Schedules (Immediate priority - Detail View) */}
            <Box sx={{ mb: 3 }}>
                <TodayScheduleCard 
                    upcomingSchedules={upcomingSchedules} 
                />
            </Box>

            {/* ROW 2: Pending Cases (Actionable Workload Insight) */}
            <Box sx={{ mb: 3 }}>
                {/* PendingCases card shows the Top 5 active cases needing attention */}
                <PendingCases cases={cases} /> 
            </Box>

            {/* REMOVED: The "GO TO FULL CALENDAR" button block previously located here */}
            
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffDashboard;