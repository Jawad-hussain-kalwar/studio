import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/ChatOutlined';
import StreamIcon from '@mui/icons-material/StreamOutlined';
import ImageIcon from '@mui/icons-material/ImageOutlined';
import MicIcon from '@mui/icons-material/MicOutlined';
import MediaIcon from '@mui/icons-material/VideoLibraryOutlined';
import AppsIcon from '@mui/icons-material/AppsOutlined';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';

const DRAWER_WIDTH = 235;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/app/home', icon: <HomeIcon />, section: 'main' },
  { label: 'Dashboard', path: '/app/dashboard', icon: <DashboardIcon />, section: 'main' },
  { label: 'API Keys', path: '/app/api-keys', icon: <KeyIcon />, section: 'main' },
  { label: 'Chat', path: '/app/studio/chat', icon: <ChatIcon />, section: 'studio' },
  { label: 'Stream', path: '/app/studio/stream', icon: <StreamIcon />, section: 'studio' },
  { label: 'Generate Image', path: '/app/studio/generate/image', icon: <ImageIcon />, section: 'studio' },
  { label: 'Generate Speech', path: '/app/studio/generate/speech', icon: <MicIcon />, section: 'studio' },
  { label: 'Generate Media', path: '/app/studio/generate/media', icon: <MediaIcon />, section: 'studio' },
  { label: 'Showcase', path: '/app/studio/showcase', icon: <AppsIcon />, section: 'studio' },
  { label: 'History', path: '/app/studio/history', icon: <HistoryIcon />, section: 'studio' },
];

const SideNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/app/studio/chat' && location.pathname === '/chat');
  };

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        // Match TopBar glassmorphic background
        backgroundColor: (theme) => theme.palette.navigation.background,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        // Remove the right border outline for a cleaner look
        // (was: borderRight "1px solid" with divider color)
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0, // Prevent shrinking
        pt: { xs: '56px', sm: '64px' }, // Offset for fixed TopBar (mobile & desktop)
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1, pt: 2, pb: 3 }}>
          {/* Main Section */}
          <List sx={{ px: 0 }}>
            {navItems
              .filter((item) => item.section === 'main')
              .map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 1.2, // increased corner radius
                      mb: 0.5,
                      bgcolor: isActive(item.path) ? 'primary.main' : 'transparent',
                      color: isActive(item.path) ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: isActive(item.path) ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.path) ? 'primary.contrastText' : 'text.secondary',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.75rem', // smaller text
                        fontWeight: isActive(item.path) ? 500 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>

          {/* Spacer between main and studio sections */}
          <Box sx={{ height: 8 }} />

          {/* Studio Section Heading */}
          {/* The divider between Home and Studio has been removed for a lighter feel.
              To ensure the heading is still visually distinct, apply a gradient
              coloured text style. */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.7rem', // slightly smaller
              fontWeight: 700,
              px: 2,
              pb: 1,
              display: 'block',
              letterSpacing: 1,
              // Gradient text
              background: (theme) => theme.customGradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Studio
          </Typography>

          <List sx={{ px: 0 }}>
            {navItems
              .filter((item) => item.section === 'studio')
              .map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2, // increased corner radius
                      mb: 0.5,
                      bgcolor: isActive(item.path) ? 'primary.main' : 'transparent',
                      color: isActive(item.path) ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: isActive(item.path) ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.path) ? 'primary.contrastText' : 'text.secondary',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.75rem', // smaller text
                        fontWeight: isActive(item.path) ? 500 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default SideNav; 