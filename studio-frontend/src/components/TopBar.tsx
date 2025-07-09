import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  alpha,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStudioStore } from '../stores/studioStore.ts';
import { ThemeToggle } from './ThemeToggle.tsx';
import { useAuth } from '../hooks/useAuth.ts';

const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  const isChatPage = location.pathname.includes('/studio/chat');
  const isImagePage = location.pathname.includes('/studio/generate/image');

  const { messages } = useStudioStore();

  const chatTitle = React.useMemo(() => {
    if (!isChatPage) return '';
    const first = messages.find((m) => m.role === 'user' && m.content?.trim());
    if (!first) return 'New Chat';
    const words = first.content.split(/\s+/).slice(0, 5);
    return words.join(' ') + (first.content.split(/\s+/).length > 5 ? '…' : '');
  }, [messages, isChatPage]);

  // Placeholder image title – later will come from store/state
  const imageTitle = 'First draft';

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  // Breadcrumb generation logic removed as breadcrumbs are no longer displayed

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        // Glassmorphic background at 50% visibility
        backgroundColor: (theme) => theme.palette.mode === 'light'
          ? 'rgba(255,255,255,0.5)'
          : 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', // Safari support
        color: 'text.primary',
        // Remove bottom border for seamless integration with side panels
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Logo + Brand */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: 3,
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src="/assets/img/logo-x128.png"
            alt="AI Studio logo"
            sx={{ width: 28, height: 28, mr: 1 }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              background:
                'linear-gradient(90deg, #014d4e 0%, #009688 25%, #8bc34a 75%, #e9d842 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI STUDIO
          </Typography>
        </Box>

        {/* Chat title & actions (only on Chat page) */}
        {isChatPage ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, ml: 7 }}>
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {chatTitle}
              </Typography>
              <Tooltip title="Edit title">
                <IconButton size="small" color="primary">
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Flexible spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Action icons */}
            <Tooltip title="Copy chat">
              <IconButton size="small" color="primary">
                <FileCopyOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="System instructions">
              <IconButton size="small" color="primary">
                <ContentPasteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Compare mode">
              <IconButton size="small" color="primary">
                <CompareArrowsOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save chat">
              <IconButton size="small" color="primary">
                <SaveOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear chat">
              <IconButton size="small" color="primary">
                <RefreshOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : isImagePage ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, ml: 7 }}>
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {imageTitle}
              </Typography>
              <Tooltip title="Edit title">
                <IconButton size="small" color="primary">
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Flexible spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Action icons for image canvas (save, download, refresh, copy, compare) */}
            <Tooltip title="Save image">
              <IconButton size="small" color="primary">
                <SaveOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download image">
              <IconButton size="small" color="primary">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Regenerate image">
              <IconButton size="small" color="primary">
                <RefreshOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy prompt">
              <IconButton size="small" color="primary">
                <FileCopyOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Compare mode">
              <IconButton size="small" color="primary">
                <CompareArrowsOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

        {/* Get API Key Button */}
        <Button
          startIcon={<KeyIcon />}
          variant="outlined"
          size="medium"
          onClick={() => navigate('/app/api-keys')}
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              bgcolor: alpha('#009688', 0.04),
            },
          }}
        >
          Get API key
        </Button>

        {/* Settings */}
        <IconButton
          size="large"
          color="primary"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 18,
            },
          }}
        >
          <SettingsIcon />
        </IconButton>

        {/* Theme Toggle */}
        <ThemeToggle
          size="large"
          color="primary"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 18,
            },
          }}
        />

        {/* Profile Menu */}
        <Tooltip title="Profile">
          <IconButton
            size="large"
            color="primary"
            onClick={handleProfileMenuOpen}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {user?.profilePicture ? (
              <Avatar
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircleIcon sx={{ fontSize: 24 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              minWidth: 220,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
              },
            },
          }}
        >
          {/* User Info */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {user?.profilePicture ? (
                <Avatar
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  sx={{ width: 40, height: 40 }}
                />
              ) : (
                <Avatar sx={{ width: 40, height: 40 }}>
                  <PersonIcon />
                </Avatar>
              )}
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider />
          
          {/* Menu Items */}
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile Settings</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar; 