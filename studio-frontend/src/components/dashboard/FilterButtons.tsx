import React from 'react';
import { Stack, Button } from '@mui/material';

interface FilterButtonsProps {
  onShowFilters?: () => void;
  onSavedFilters?: () => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ onShowFilters, onSavedFilters }) => {
  return (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" size="small" onClick={onShowFilters}>
        Show Filters
      </Button>
      <Button variant="outlined" size="small" onClick={onSavedFilters}>
        Saved Filters
      </Button>
    </Stack>
  );
};

export default FilterButtons; 