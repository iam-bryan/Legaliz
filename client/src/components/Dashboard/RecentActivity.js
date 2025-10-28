import React from 'react';
import { Card, CardHeader, CardContent, List, ListItem, ListItemText, Typography, Box, Divider, CircularProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Helper to format time (e.g., "5m ago", "Yesterday")
const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.max(0, Math.floor((now.getTime() - past.getTime()) / 1000));
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return `Yesterday at ${past.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString(); // Older than a week
};

const RecentActivity = ({ activities, loading }) => {
  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 3, height: '100%' }}>
      <CardHeader title="Recent Activity" />
      <CardContent sx={{ pt: 0, maxHeight: 350, overflowY: 'auto', position: 'relative' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>}
        {!loading && activities.length === 0 && <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>No recent activity logged.</Typography>}
        {!loading && activities.length > 0 && (
          <List dense disablePadding>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Typography component="span" variant="body2" sx={{ fontWeight: 'medium' }}>
                        {activity.user_name || 'System'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                           <AccessTimeIcon sx={{ fontSize: '0.9rem', verticalAlign: 'middle', mr: 0.5 }} />
                           {formatTimeAgo(activity.time)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider component="li" variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;