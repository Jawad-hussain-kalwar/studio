import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SideNav from './SideNav.tsx';
import TopBar from './TopBar.tsx';

const AppLayout: React.FC = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar - Full Width */}
      <TopBar />
      
      {/* Content Area with Side Navigation */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Side Navigation */}
        <SideNav />
        
        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ height: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout; 