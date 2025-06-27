import React from 'react';
import {
  Box,
} from '@mui/material';

interface ImageCanvasProps {
  src: string;
  prompt: string;
  title?: string;
  onSave?: () => void;
  onDownload?: () => void;
  onRefresh?: () => void;
  onCopyPrompt?: () => void;
  onCompare?: () => void;
}

/**
 * Displays the generated image with floating toolbar and prompt display.
 */
const ImageCanvas: React.FC<ImageCanvasProps> = ({
  src,
  title = 'Untitled',
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pt: 2,
        pb: 24,
      }}
    >
      {/* Image */}
      <Box
        component="img"
        src={src}
        alt={title}
        sx={{
          maxWidth: '90%',
          maxHeight: { xs: '60vh', sm: '70vh' },
          objectFit: 'contain',
          borderRadius: 2,
        }}
      />
    </Box>
  );
};

export default ImageCanvas; 