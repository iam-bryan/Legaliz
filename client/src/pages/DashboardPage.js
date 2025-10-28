import React, { useState, useEffect } from 'react';
import {
  Grid, Box, Typography, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, Card, CardHeader
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

import StatCard from '../components/Dashboard/StatCard';
import PendingCases from '../components/Dashboard/PendingCases';
import RecentActivity from '../components/Dashboard/RecentActivity';
import CaseOverviewChart from '../components/Dashboard/CaseOverviewChart';
import StaffDashboard from '../components/Dashboard/StaffDashboard';
// FIX: Import the new SchedulePanel
import SchedulePanel from '../components/Dashboard/SchedulePanel';

import apiService from '../api/apiService';
import authService from '../api/authService';

// Minimalist styling for Toggle Buttons
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    '&.Mui-disabled': { border: 0 },
    '&:not(:first-of-type)': { borderRadius: theme.shape.borderRadius },
    '&:first-of-type': { borderRadius: theme.shape.borderRadius },
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
      fontWeight: 'medium',
    },
  },
}));

// Helper to calculate upcoming schedules count (from SchedulePanel.js helpers)
const normalizeDate = (s) => {
  if (!s) return null;
  const val = s.start_date || s.start || s;
  if (!val) return null;
  try {
    const iso = String(val);
    if (iso.includes('T')) return iso.split('T')[0];
    const d = new Date(iso);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  } catch (e) {}
  return null;
};

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [stats, setStats] = useState({ total: 0, open: 0, clients: 0 });
  const [cases, setCases] = useState([]);
  const [workloadData, setWorkloadData] = useState({ labels: [], data: [] });
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingWorkload, setLoadingWorkload] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7d');

  // Load user (support sync or async authService.getCurrentUser)
  useEffect(() => {
    setUserLoading(true);
    try {
      const maybePromise = authService.getCurrentUser();
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise
          .then(u => setUser(u))
          .catch(err => {
            console.error('getCurrentUser failed', err);
            setUser(null);
          })
          .finally(() => setUserLoading(false));
      } else {
        setUser(maybePromise || null);
        setUserLoading(false);
      }
    } catch (e) {
      console.error(e);
      setUser(null);
      setUserLoading(false);
    }
  }, []);

  // Fetch dashboard data (schedules, cases, etc.)
  useEffect(() => {
    setLoadingStats(true);
    setError('');
    
    // FIX: Calculate Date Range for schedules
    const today = new Date();
    const startStr = today.toISOString().split('T')[0];
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    const endStr = oneYearFromNow.toISOString().split('T')[0];

    Promise.all([
      apiService.getCases().catch(() => ({ data: { records: [] } })),
      apiService.getClients().catch(() => ({ data: { records: [] } })),
      // Pass the calculated date range
      apiService.getSchedules(startStr, endStr).catch(() => ({ data: { records: [] } })),
      apiService.getRecentActivity(10).catch(() => ({ data: { records: [] } }))
    ])
      .then(([casesRes, clientsRes, schedulesRes, activityRes]) => {
        const allCases = casesRes?.data?.records || [];
        const openCases = allCases.filter(c => c.status !== 'closed');
        const allClients = clientsRes?.data?.records || [];
        const schedulesData = Array.isArray(schedulesRes?.data) ? schedulesRes.data : (schedulesRes?.data?.records || []);
        setCases(allCases);
        setStats({ total: allCases.length, open: openCases.length, clients: allClients.length });
        setUpcomingSchedules(schedulesData);
        setRecentActivity(activityRes?.data?.records || []);
      })
      .catch(err => {
        setError('Failed to fetch initial dashboard data.');
        console.error(err);
      })
      .finally(() => setLoadingStats(false));
  }, []);

  // Workload data
  useEffect(() => {
    setLoadingWorkload(true);
    apiService.getWorkloadData(timeRange)
      .then(workloadRes => setWorkloadData(workloadRes?.data || { labels: [], data: [] }))
      .catch(err => {
        setError(prev => (prev ? prev + ' ' : '') + 'Failed to fetch workload data.');
        console.error(err);
      })
      .finally(() => setLoadingWorkload(false));
  }, [timeRange]);

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) setTimeRange(newRange);
  };

  // Show overall loading until we know the user and initial data
  if (userLoading || loadingStats) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  // compute staff flag after user is loaded
  const isStaff = !!(user && (user.role === 'staff' || (Array.isArray(user.roles) && user.roles.includes('staff'))));
  const todayDate = new Date().toISOString().split('T')[0];
  const upcoming7DaysCount = upcomingSchedules.filter(s => {
    const date = normalizeDate(s);
    if (!date) return false;
    const dateObj = new Date(date);
    const todayObj = new Date(todayDate);
    const diffTime = dateObj.getTime() - todayObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays < 7;
  }).length;


  // Render StaffDashboard for staff users
  if (isStaff) {
    return (
      <StaffDashboard
        upcomingSchedules={upcomingSchedules}
        cases={cases} // <-- ENSURE cases DATA IS PASSED HERE
      />
    );
  }

  // Regular user dashboard
  if (error && cases.length === 0) return <Alert severity="error">{error}</Alert>;
  const activeCases = cases.filter(c => c.status !== 'closed');

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        Good Morning, {user?.name || 'User'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        You have {activeCases.length} active case(s) requiring attention.
      </Typography>

      {error && !loadingStats && cases.length > 0 && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Stat Cards (unchanged) */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Cases" value={stats.total} icon={<GavelIcon />} color="#2065D1" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Cases" value={stats.open} icon={<CheckCircleOutlineIcon />} color="#388E3C" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Clients" value={stats.clients} icon={<PeopleOutlineIcon />} color="#ED6C02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upcoming (7d)" value={upcoming7DaysCount} icon={<AssignmentLateIcon />} color="#D32F2F" />
        </Grid>

        <Grid item xs={12} md={4}>
          <RecentActivity activities={recentActivity} loading={loadingStats} />
        </Grid>

        <Grid item xs={12} md={4}>
          <PendingCases cases={cases} />
        </Grid>

        <Grid item xs={12} md={4}>
          <SchedulePanel 
            upcomingSchedules={upcomingSchedules} 
            title="This Week's Schedule" 
            daysToShow={7} 
          />
        </Grid>

        {/* New Cases & Status Overview - Full Width */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
            <CardHeader
              title="New Cases & Status Overview"
              action={
                <StyledToggleButtonGroup value={timeRange} exclusive onChange={handleTimeRangeChange} aria-label="time range" size="small">
                  <ToggleButton value="7d" aria-label="last 7 days" sx={{ textTransform: 'none' }}>Week</ToggleButton>
                  <ToggleButton value="30d" aria-label="last 30 days" sx={{ textTransform: 'none' }}>Month</ToggleButton>
                  <ToggleButton value="1y" aria-label="last year" sx={{ textTransform: 'none' }}>Year</ToggleButton>
                </StyledToggleButtonGroup>
              }
              titleTypographyProps={{ variant: 'h6', fontWeight: 'medium' }}
              sx={{ pb: 0 }}
            />
            <Box sx={{ position: 'relative' }}>
              <CaseOverviewChart workloadData={workloadData} cases={cases} />
              {loadingWorkload && (
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.5)', zIndex: 1,
                }}>
                  <CircularProgress size={40} />
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;