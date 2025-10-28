import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// ... (capitalize function and breadcrumbNameMap remain the same) ...
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const breadcrumbNameMap = { };

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // FIX: If we are on the dashboard, render nothing.
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <MuiBreadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
      >
        {/* Always add Home/Dashboard link */}
        <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
          Dashboard
        </Link>
        
        {/* Filter out 'dashboard' (in case of /dashboard/other) */}
        {pathnames.filter(p => p.toLowerCase() !== 'dashboard').map((value, index, arr) => {
          const last = index === arr.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          let name = breadcrumbNameMap[value] || capitalize(value);

          // ... (dynamic segment logic remains the same) ...
          if (pathnames[index - 1] === 'cases' && !isNaN(value)) { }
          if (pathnames[index - 1] === 'clients' && !isNaN(value)) { }
          if (value === 'edit') name = 'Edit';
          if (value === 'new') name = 'New';

          return last ? (
            <Typography color="text.primary" key={to}>
              {name}
            </Typography>
          ) : (
            <Link component={RouterLink} underline="hover" color="inherit" to={to} key={to}>
              {name}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;