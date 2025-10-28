import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumbs from './Modals/Breadcrumbs';
import AiFloatingButton from './AiAssistant/AiFloatingButton';
import AiSidebar from './AiAssistant/AiSidebar';


const expandedDrawerWidth = 240;
const collapsedDrawerWidth = 80;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const { pathname } = useLocation();

  const currentDrawerWidth = isSidebarOpen ? expandedDrawerWidth : collapsedDrawerWidth;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAiOpen = () => {
    setAiOpen(true);
  };

  const handleAiClose = () => {
    setAiOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header
        handleDrawerToggle={handleDrawerToggle}
        handleSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
      />
      <Sidebar
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
        drawerWidth={currentDrawerWidth}
        isSidebarOpen={isSidebarOpen}
        expandedWidth={expandedDrawerWidth}
      />
      <Box
        component="main"
        sx={(theme) => ({ // Use the theme function to access palette
          flexGrow: 1,
          p: 3,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',

        })}
      >
        <Toolbar /> 
        
        <Breadcrumbs /> 

        <Outlet />
      </Box>

      {/* AI Assistant Components */}
      <AiFloatingButton onClick={handleAiOpen} />
      <AiSidebar open={aiOpen} onClose={handleAiClose} currentPath={pathname} />
    </Box>
  );
};

export default Layout;