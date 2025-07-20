import React from 'react';
import { Paper, Typography } from '@mui/material';

const TimeToFirstTokenCard: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color="text.secondary">Time to First Token</Typography>
  </Paper>
);

export default TimeToFirstTokenCard; 