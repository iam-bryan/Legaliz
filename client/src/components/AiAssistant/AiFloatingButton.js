import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const AiFloatingButton = ({ onClick }) => {
  return (
    <Tooltip title="Libra AI" placement="left" arrow>
      <Fab
        color="primary"
        aria-label="AI Assistant"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 28 }} />
      </Fab>
    </Tooltip>
  );
};

export default AiFloatingButton;
