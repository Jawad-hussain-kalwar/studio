import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  InputBase,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Styled search component
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const TopBar: React.FC = () => {
  const location = useLocation();

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathSegments.includes('studio')) {
      breadcrumbs.push({ label: 'Studio', path: '/app/studio/chat' });
      
      if (pathSegments.includes('chat')) {
        breadcrumbs.push({ label: 'Chat', path: '/app/studio/chat', active: true });
      } else if (pathSegments.includes('stream')) {
        breadcrumbs.push({ label: 'Stream', path: '/app/studio/stream', active: true });
      } else if (pathSegments.includes('generate')) {
        if (pathSegments.includes('image')) {
          breadcrumbs.push({ label: 'Generate Image', path: '/app/studio/generate/image', active: true });
        } else if (pathSegments.includes('speech')) {
          breadcrumbs.push({ label: 'Generate Speech', path: '/app/studio/generate/speech', active: true });
        } else if (pathSegments.includes('media')) {
          breadcrumbs.push({ label: 'Generate Media', path: '/app/studio/generate/media', active: true });
        }
      } else if (pathSegments.includes('build')) {
        breadcrumbs.push({ label: 'Build', path: '/app/studio/build', active: true });
      } else if (pathSegments.includes('history')) {
        breadcrumbs.push({ label: 'History', path: '/app/studio/history', active: true });
      }
    } else if (pathSegments.includes('dashboard')) {
      breadcrumbs.push({ label: 'Dashboard', path: '/app/dashboard', active: true });
    } else if (pathSegments.includes('home')) {
      breadcrumbs.push({ label: 'Home', path: '/app/home', active: true });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Breadcrumbs */}
        <Box sx={{ flexGrow: 1 }}>
          <Breadcrumbs aria-label="breadcrumb">
            {breadcrumbs.map((crumb) => (
              crumb.active ? (
                <Typography key={crumb.path} color="text.primary" fontWeight={500}>
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.path}
                  component={RouterLink}
                  to={crumb.path}
                  underline="hover"
                  color="inherit"
                >
                  {crumb.label}
                </Link>
              )
            ))}
          </Breadcrumbs>
        </Box>

        {/* Search Bar */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        {/* Get API Key Button */}
        <Button
          startIcon={<KeyIcon />}
          variant="outlined"
          size="small"
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
          color="inherit"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <SettingsIcon />
        </IconButton>

        {/* Profile Menu */}
        <IconButton
          size="large"
          color="inherit"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
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