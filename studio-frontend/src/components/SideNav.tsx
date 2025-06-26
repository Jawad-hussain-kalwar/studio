import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Chat as ChatIcon,
  Stream as StreamIcon,
  Image as ImageIcon,
  Mic as MicIcon,
  VideoLibrary as MediaIcon,
  Build as BuildIcon,
  History as HistoryIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 235;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/app/home', icon: <HomeIcon />, section: 'main' },
  { label: 'Chat', path: '/app/studio/chat', icon: <ChatIcon />, section: 'studio' },
  { label: 'Stream', path: '/app/studio/stream', icon: <StreamIcon />, section: 'studio' },
  { label: 'Generate Image', path: '/app/studio/generate/image', icon: <ImageIcon />, section: 'studio' },
  { label: 'Generate Speech', path: '/app/studio/generate/speech', icon: <MicIcon />, section: 'studio' },
  { label: 'Generate Media', path: '/app/studio/generate/media', icon: <MediaIcon />, section: 'studio' },
  { label: 'Build', path: '/app/studio/build', icon: <BuildIcon />, section: 'studio' },
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
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* AI STUDIO Logo */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(90deg, #014d4e 0%, #009688 25%, #8bc34a 75%, #e9d842 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          AI STUDIO
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, px: 1 }}>
        {/* Main Section */}
        {navItems
          .filter((item) => item.section === 'main')
          .map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
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
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 500 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

        <Divider sx={{ my: 2 }} />

        {/* Studio Section */}
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 600,
            px: 2,
            pb: 1,
          }}
        >
          Studio
        </Typography>

        {navItems
          .filter((item) => item.section === 'studio')
          .map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
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
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 500 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Drawer>
  );
};

export default SideNav; 