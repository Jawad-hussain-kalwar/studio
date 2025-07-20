import React from 'react';
import { Paper, Typography } from '@mui/material';

const QuantilesCard: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color="text.secondary">Quantiles</Typography>
  </Paper>
);

export default QuantilesCard; 