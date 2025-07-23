import React from 'react';
import { Box, Typography } from '@mui/material';
import PromptCard from './PromptCard';
import type { PromptCard as PromptCardType } from '../../types/index.ts';

interface PromptCardGridProps {
  onPromptSelect: (prompt: string) => void;
}

// Mock data based on the Google AI Studio screenshot
const promptCards: PromptCardType[] = [
  {
    id: '1',
    title: 'URL context tool',
    description: 'Fetch information from web links',
    prompt: 'Please analyze the content from this URL and provide a summary of the key information.',
    category: 'Tool',
    isNew: true,
  },
  {
    id: '2',
    title: 'Native speech generation',
    description: 'Generate high quality text to speech with Gemini',
    prompt: 'Convert this text to natural-sounding speech with appropriate intonation and pacing.',
    category: 'Audio',
    isNew: true,
  },
  {
    id: '3',
    title: 'Live audio-to-audio dialog',
    description: "Try Gemini's natural, real-time dialog with audio and video inputs",
    prompt: 'Start a natural conversation with audio input and responses.',
    category: 'Audio',
    isNew: true,
  },
  {
    id: '4',
    title: 'Native image generation',
    description: 'Interleaved text-and-image generation with the new Gemini 2.0 Flash',
    prompt: 'Generate images based on detailed descriptions with high quality and accuracy.',
    category: 'Image',
    isNew: true,
  },
];

const PromptCardGrid: React.FC<PromptCardGridProps> = ({ onPromptSelect }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        px: 4,
        pt: { xs: 14, sm: 16 },
        pb: 20,
      }}
    >
      {/* Welcome Header */}
      <Typography
        variant="h3"
        sx={{
          fontSize: { xs: '2rem', md: '2.5rem' },
          fontWeight: 500,
          background: (theme) => theme.customGradients.welcome,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          mb: 6,
        }}
      >
        Welcome to AI Studio
      </Typography>

      {/* What's new section */}
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            mb: 3,
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          What's new
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',                    // 1 column on mobile
              sm: 'repeat(2, 1fr)',         // 2x2 on small screens
              md: 'repeat(2, 1fr)',         // 2x2 on medium screens
              lg: 'repeat(2, 1fr)',         // 2x2 on large screens
              xl: 'repeat(2, 1fr)',         // Keep 2x2 on extra large screens
            },
            '@media (min-width: 1600px)': {
              gridTemplateColumns: 'repeat(3, 1fr)', // 3x2 only on very wide screens (1600px+)
            },
            gap: 2,
          }}
        >
          {promptCards.map((card) => (
            <PromptCard key={card.id} card={card} onClick={onPromptSelect} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PromptCardGrid; 