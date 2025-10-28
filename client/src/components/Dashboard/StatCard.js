import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// This component is for the summary cards at the top of the dashboard
// FIX: Added destinationPath prop
const StatCard = ({ title, value, icon, color, destinationPath }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (destinationPath) {
      navigate(destinationPath);
    }
  };

  return (
    <Card 
      // FIX: Added onClick handler and style to indicate clickability
      onClick={handleClick}
      sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          borderRadius: '12px', 
          boxShadow: 3,
          cursor: destinationPath ? 'pointer' : 'default', // Change cursor if clickable
          transition: 'transform 0.2s', // Add subtle hover effect
          '&:hover': destinationPath ? { transform: 'translateY(-3px)', boxShadow: 6 } : {}
      }}
    >
      <Box sx={{
          backgroundColor: color || 'primary.main',
          color: 'white',
          borderRadius: '50%',
          p: 2,
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        {icon}
      </Box>
      <Box>
        <Typography color="text.secondary" sx={{ fontWeight: 'medium' }}>{title}</Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
    </Card>
  );
};

export default StatCard;