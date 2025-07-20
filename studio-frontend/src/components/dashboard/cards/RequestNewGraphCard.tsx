import React from 'react';
import { Paper, Typography } from '@mui/material';

const RequestNewGraphCard: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 2, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color="text.secondary">Request a new graph</Typography>
  </Paper>
);

export default RequestNewGraphCard; 