import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import type { ModelInfo } from '../../types/index.ts';

interface Props {
  open: boolean;
  onClose: () => void;
  model: ModelInfo | undefined;
}

const JsonBlock: React.FC<{ data: unknown }> = ({ data }) => (
  <Box
    component="pre"
    sx={{
      bgcolor: (theme) => theme.palette.codeBlock.background,
      p: 2,
      borderRadius: 1,
      overflow: 'auto',
      maxHeight: 400,
      fontSize: '0.75rem',
    }}
  >
    {JSON.stringify(data, null, 2)}
  </Box>
);

const ModelMetadataDialog: React.FC<Props> = ({ open, onClose, model }) => {
  if (!model) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Model details – {model.displayLabel || model.name}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>Metadata</Typography>
        <JsonBlock data={model.metadata} />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Capabilities</Typography>
        <JsonBlock data={model.capabilities} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelMetadataDialog; 