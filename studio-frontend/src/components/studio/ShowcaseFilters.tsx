import React from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import type { ShowcaseFilter, ShowcaseCategory } from '../../types/showcase';

interface ShowcaseFiltersProps {
  categories: ShowcaseFilter[];
  activeCategory: ShowcaseCategory | 'all';
  onCategoryChange: (category: ShowcaseCategory | 'all') => void;
}

const ShowcaseFilters: React.FC<ShowcaseFiltersProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        Filter by Category
      </Typography>
      
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        gap={1}
        sx={{
          // Hide scrollbar but allow horizontal scroll on mobile
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none'
        }}
      >
        {categories.map((category) => (
          <Chip
            key={category.category}
            label={`${category.label}${category.count ? ` (${category.count})` : ''}`}
            clickable
            variant={activeCategory === category.category ? 'filled' : 'outlined'}
            color={activeCategory === category.category ? 'primary' : 'default'}
            onClick={() => onCategoryChange(category.category)}
            sx={{
              fontSize: '0.8rem',
              fontWeight: activeCategory === category.category ? 600 : 400,
              height: '32px',
              minWidth: 'fit-content',
              borderRadius: '16px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: (theme) => theme.palette.mode === 'light'
                  ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              },
              // Custom styling for active state
              ...(activeCategory === category.category && {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }),
              // Custom styling for inactive state
              ...(activeCategory !== category.category && {
                backgroundColor: 'transparent',
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderColor: 'primary.main',
                  color: 'text.primary',
                },
              }),
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ShowcaseFilters; 