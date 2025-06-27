import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  SettingsOutlined as SettingsIcon,
  AccountCircleOutlined as AccountCircleIcon,
  KeyOutlined as KeyIcon,
  EditOutlined as EditOutlinedIcon,
  FileCopyOutlined as FileCopyOutlinedIcon,
  ContentPasteOutlined as ContentPasteOutlinedIcon,
  CompareArrowsOutlined as CompareArrowsOutlinedIcon,
  SaveOutlined as SaveOutlinedIcon,
  RefreshOutlined as RefreshOutlinedIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useStudioStore } from '../stores/studioStore.ts';
import { ThemeToggle } from './ThemeToggle.tsx';

const TopBar: React.FC = () => {
  const location = useLocation();

  const isChatPage = location.pathname.includes('/studio/chat');

  const { messages } = useStudioStore();

  const chatTitle = React.useMemo(() => {
    if (!isChatPage) return '';
    const first = messages.find((m) => m.role === 'user' && m.content?.trim());
    if (!first) return 'New Chat';
    const words = first.content.split(/\s+/).slice(0, 5);
    return words.join(' ') + (first.content.split(/\s+/).length > 5 ? '…' : '');
  }, [messages, isChatPage]);

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
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

        {/* Get API Key Button */}
        <Button
          startIcon={<KeyIcon />}
          variant="outlined"
          size="medium"
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
        <IconButton
          size="large"
          color="primary"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 24,
            },
          }}
        >
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar; 