import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import authService from '../api/authService';

// Styling for the drawer component itself
const drawerSx = (width) => ({
  width: width,
  transition: (theme) => theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: width,
    transition: (theme) => theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    borderRight: (theme) => `1px solid ${theme.palette.divider}`,
    boxSizing: 'border-box',
    backgroundColor: (theme) => theme.palette.background.paper,
    height: 'calc(100vh - 56px)', // Adjusted for clarity/accuracy, assuming 100vh
    top: '56px', // Start below navbar
    marginTop: 0,
  },
});

const Sidebar = ({ handleDrawerToggle, mobileOpen, drawerWidth, isSidebarOpen, expandedWidth }) => {
  const user = authService.getCurrentUser();
  // 💡 HINT: Use the useTheme hook if you need theme values directly in the component logic
  const theme = useTheme();

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['admin', 'partner', 'lawyer', 'staff', 'client'] },
    { text: 'Cases', path: '/cases', icon: <GavelIcon />, roles: ['partner', 'lawyer', 'staff', 'client'] },
    { text: 'Clients', path: '/clients', icon: <PeopleIcon />, roles: ['admin', 'partner', 'lawyer', 'staff'] },
    { text: 'Documents', path: '/documents', icon: <FolderIcon />, roles: ['partner', 'lawyer', 'staff', 'client'] },
    { text: 'Calendar', path: '/calendar', icon: <CalendarMonthIcon />, roles: ['partner', 'lawyer', 'staff', 'client'] },
    { text: 'Billing', path: '/billing', icon: <ReceiptIcon />, roles: ['partner', 'lawyer', 'staff'] },
    { text: 'User Management', path: '/admin/users', icon: <AdminPanelSettingsIcon />, roles: ['admin'] },
  ];

  const drawerContent = (
    <div>
      <Divider />
      <List sx={{ pt: 9}}>
        {menuItems
          .filter(item => {
            // Always show Dashboard
            if (item.text === 'Dashboard') return true;
            
            // For other items, check user role
            if (!user?.role) return false;
            
            return item.roles.includes(user.role);
          })
          .map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                title={item.text}
                sx={{
                  minHeight: 48,
                  justifyContent: isSidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                  py: 1.2,
                  margin: '4px 12px',
                  borderRadius: '8px',
                  color: 'text.secondary',
                  '&.active': {
                    backgroundColor: theme.palette.primary.main + '14', // '14' is 8% opacity in hex
                    // Text/Icon Color: Use the Primary color itself for high contrast
                    color: theme.palette.primary.main, 
                    fontWeight: 'bold',
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '&:hover': {
                    // Use theme's action.hover for default behavior, which is better than hardcoded rgba(0, 0, 0, 0.04)
                    backgroundColor: theme.palette.action.hover, 
                  },
                  '&.Mui-focusVisible': {
                    // Use theme's action.focus for consistency
                    backgroundColor: theme.palette.action.focus
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: isSidebarOpen ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: isSidebarOpen ? 1 : 0,
                    transition: 'opacity 0.2s',
                    color: 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
        transition: (theme) => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
      aria-label="main navigation"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': drawerSx(expandedWidth)
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': drawerSx(drawerWidth)
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;