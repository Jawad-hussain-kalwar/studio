import React from 'react';
import { Paper, Typography } from '@mui/material';

const ScoresCard: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color="text.secondary">Scores</Typography>
  </Paper>
);

export default ScoresCard; 