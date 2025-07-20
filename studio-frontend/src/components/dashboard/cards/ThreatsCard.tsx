import React from 'react';
import { Paper, Typography } from '@mui/material';

const ThreatsCard: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color="text.secondary">Threats</Typography>
  </Paper>
);

export default ThreatsCard; 