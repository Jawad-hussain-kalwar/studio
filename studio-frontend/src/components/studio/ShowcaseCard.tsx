import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Stack,
} from '@mui/material';
import type { ShowcaseApplication } from '../../types/showcase';
import LaunchIcon from '@mui/icons-material/LaunchOutlined';
import CodeIcon from '@mui/icons-material/CodeOutlined';

interface ShowcaseCardProps {
  application: ShowcaseApplication;
  onViewDemo?: (app: ShowcaseApplication) => void;
  onViewSource?: (app: ShowcaseApplication) => void;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  application,
  onViewDemo,
  onViewSource,
}) => {
  const handleViewDemo = () => {
    if (onViewDemo) {
      onViewDemo(application);
    }
  };

  const handleViewSource = () => {
    if (onViewSource) {
      onViewSource(application);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        // Glassmorphic design matching theme
        backgroundColor: (theme) => theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(30, 30, 30, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: (theme) => `1px solid ${
          theme.palette.mode === 'light' 
            ? 'rgba(0, 0, 0, 0.08)' 
            : 'rgba(255, 255, 255, 0.08)'
        }`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.palette.mode === 'light'
            ? '0 8px 32px rgba(0, 0, 0, 0.12)'
            : '0 8px 32px rgba(0, 0, 0, 0.4)',
          backgroundColor: (theme) => theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(30, 30, 30, 0.95)',
        },
      }}
      onClick={handleViewDemo}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header with icon and featured badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            src={application.icon}
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              backgroundColor: 'primary.main',
              fontSize: '1.2rem'
            }}
          >
            {application.title.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            {application.featured && (
              <Chip
                label="Featured"
                size="small"
                color="primary"
                sx={{ 
                  mb: 1,
                  fontSize: '0.7rem',
                  height: '20px'
                }}
              />
            )}
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 1,
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'text.primary'
          }}
        >
          {application.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: 'text.secondary',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {application.description}
        </Typography>

        {/* API Endpoints */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              mb: 0.5,
              display: 'block'
            }}
          >
            API Endpoints:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {application.apiEndpoints.slice(0, 2).map((endpoint, index) => (
              <Chip
                key={index}
                label={endpoint}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.65rem',
                  height: '20px',
                  color: 'text.secondary',
                  borderColor: 'divider'
                }}
              />
            ))}
            {application.apiEndpoints.length > 2 && (
              <Chip
                label={`+${application.apiEndpoints.length - 2} more`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.65rem',
                  height: '20px',
                  color: 'text.secondary',
                  borderColor: 'divider'
                }}
              />
            )}
          </Stack>
        </Box>
      </CardContent>

      {/* Tags at bottom */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          {application.tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              label={tag.label}
              size="small"
              color={tag.color || 'default'}
              sx={{
                fontSize: '0.7rem',
                height: '24px'
              }}
            />
          ))}
          {application.tags.length > 3 && (
            <Chip
              label={`+${application.tags.length - 3}`}
              size="small"
              color="default"
              sx={{
                fontSize: '0.7rem',
                height: '24px'
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Action buttons */}
      <CardActions sx={{ px: 2, py: 1, pt: 0 }}>
        <Button
          size="small"
          startIcon={<LaunchIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDemo();
          }}
          sx={{ fontSize: '0.75rem' }}
        >
          Try Demo
        </Button>
        {application.sourceUrl && (
          <Button
            size="small"
            startIcon={<CodeIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewSource();
            }}
            sx={{ fontSize: '0.75rem' }}
          >
            View Code
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ShowcaseCard; 