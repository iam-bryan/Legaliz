import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem,
    Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService from '../api/authService';
import apiService from '../api/apiService';

const collapsedDrawerWidth = 80;
const FULL_PROJECT_URL = (process.env.REACT_APP_API_URL || '').replace('/api', '');

const Header = ({ handleDrawerToggle, handleSidebarToggle }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const user = authService.getCurrentUser();
  const userName = user ? user.name : 'User';
  const userRole = user ? user.role : 'Guest';
  const avatarLetters = userName.split(' ').map(n => n[0]).join('');

  const loadProfilePicture = () => {
    apiService.getProfilePicture()
      .then(response => {
        if (response.data.has_picture) {
          setProfilePicture(FULL_PROJECT_URL + response.data.file_path);
        } else {
          setProfilePicture(null);
        }
      })
      .catch(err => {
        console.error('Failed to load profile picture:', err);
      });
  };

  useEffect(() => {
    loadProfilePicture();

    // Listen for profile picture updates
    const handleProfileUpdate = () => {
      loadProfilePicture();
    };

    window.addEventListener('profilePictureUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
    };
  }, []);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
<AppBar
  position="fixed"
  sx={(theme) => ({ // Use the theme function to access palette
    width: '100%',
    ml: 0,
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
  })}
  elevation={0}

    >
      <Toolbar sx={{ pl: { sm: 0 } }}>
        {/* Hamburger Menu Wrapper (Desktop) */}
        <Box
          sx={{
            width: collapsedDrawerWidth,
            display: { xs: 'none', sm: 'flex' },
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexShrink: 0,
            pl: 2.5,
            boxSizing: 'border-box'
          }}
        >
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleSidebarToggle}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Hamburger Menu (Mobile) */}
         <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* --- Spacer --- */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right-side User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Notification Icon and Divider are removed */}

          {/* User Info Box */}
          <Box
            sx={(theme) => ({ // Use the theme function to access palette
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                p: 0.5,
                borderRadius: '8px',
                // Theme's action.hover is used implicitly, which is good.
                '&:hover': { backgroundColor: theme.palette.action.hover },
                mr: 1 
            })}
            onClick={handleMenu}
          >
            <Box sx={{ mr: 1.5, ml: 0.5, textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {userName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {userRole}
                </Typography>
            </Box>

            {/* Avatar now correctly inherits primary.main from the theme and shows profile picture */}
            <Avatar 
              src={profilePicture || undefined}
              sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}
            >
                {!profilePicture && avatarLetters}
            </Avatar>
          </Box>

          {/* User Menu Dropdown */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} component={RouterLink} to="/profile">
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;