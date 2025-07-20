import React from 'react';
import { Paper, Typography } from '@mui/material';

const FeedbackCard: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color="text.secondary">Feedback / Bool Scores</Typography>
  </Paper>
);

export default FeedbackCard; 