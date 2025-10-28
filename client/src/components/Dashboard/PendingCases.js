import React from 'react';
import { Card, CardHeader, List, ListItem, ListItemText, LinearProgress, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

// This component displays the list of cases with their progress bars
const PendingCases = ({ cases = [] }) => {
  // Show the 5 most recent cases that are not closed
  const pending = cases.filter(c => c.status !== 'closed').slice(0, 5);

  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 3, display: 'flex', flexDirection: 'column', height: '400px' }}>
      <CardHeader title="Pending Cases" sx={{ flexShrink: 0 }} />
      <List sx={{ flexGrow: 1, overflowY: 'auto', pt: 0 }}>
        {pending.length > 0 ? pending.map(caseItem => (
          <ListItem
            key={caseItem.id}
            component={Link}
            to={`/cases/${caseItem.id}`}
            sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, textDecoration: 'none', color: 'inherit' }}
          >
            <ListItemText
              primary={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'medium',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px'
                  }}
                >
                  {caseItem.title}
                </Typography>
              }
              secondary={
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    maxWidth: '200px'
                  }}
                >
                  Client: {caseItem.client_name}
                </Typography>
              }
            />
            <Box sx={{ width: '30%', minWidth: '80px', ml: 2, flexShrink: 0 }}>
              <LinearProgress variant="determinate" value={caseItem.progress || 0} sx={{ height: 8, borderRadius: 5 }} />
              <Typography variant="caption" color="text.secondary">{`${caseItem.progress || 0}%`}</Typography>
            </Box>
          </ListItem>
        )) : <ListItem><ListItemText primary="No pending cases found." /></ListItem>}
      </List>
    </Card>
  );
};

export default PendingCases;