import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  alpha,
} from '@mui/material';
import type { PromptCard as PromptCardType } from '../../types/index.ts';

interface PromptCardProps {
  card: PromptCardType;
  onClick: (prompt: string) => void;
}

// Map categories to images
const getCategoryImage = (category: string): string => {
  const imageMap: Record<string, string> = {
    'Tool': '/assets/img/ui/blob1-ul.jpg',
    'Audio': '/assets/img/ui/wave2.jpg',
    'Image': '/assets/img/ui/blob3.jpg',
    'Video': '/assets/img/ui/lamp1.jpg',
  };
  return imageMap[category] || '/assets/img/ui/blob2.jpg';
};

const PromptCard: React.FC<PromptCardProps> = ({ card, onClick }) => {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: 100, // Reduced height to accommodate square image
        display: 'flex',
        flexDirection: 'row',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: 'primary.main',
        },
      }}
      onClick={() => onClick(card.prompt)}
    >
      {/* Left side image */}
      <Box
        sx={{
          width: 100, // Square dimensions
          height: 100, // Square dimensions
          flexShrink: 0, // Prevent image from shrinking
          backgroundImage: `url(${getCategoryImage(card.category)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '12px 0 0 12px',
        }}
      />
      
      {/* Content area */}
      <CardContent sx={{ p: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header with title and new badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              lineHeight: 1.2,
              fontSize: '0.9rem',
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {card.title}
          </Typography>
          {card.isNew && (
            <Chip
              label="New"
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
                fontSize: '0.5rem',
                height: 18,
                flexShrink: 0,
                '& .MuiChip-label': {
                  px: 0.75,
                },
              }}
            />
          )}
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.3,
            fontSize: '0.75rem',
            flexGrow: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {card.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PromptCard; 