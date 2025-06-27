import React from 'react';
import { Box } from '@mui/material';
import ImageRunSettingsPanel from '../../../components/studio/ImageRunSettingsPanel.tsx';
import ImageCanvas from '../../../components/studio/ImageCanvas.tsx';
import ChatInputDock from '../../../components/studio/ChatInputDock.tsx';
import { useState } from 'react';

/**
 * GenerateImagePage
 * -----------------
 * Simple playground skeleton for text-to-image generation.
 * Layout mirrors ChatPlayground but replaces the chat area with an
 * image canvas / placeholder.
 */
const GenerateImagePage: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setCurrentPrompt(prompt);
    setIsGenerating(true);
    // TODO: call image generation API here
    // simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Main Canvas */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
          position: 'relative',
          pt: { xs: 9, sm: 10 }, // offset for fixed TopBar (72/80px)
          pb: 4, // add some bottom padding below prompt bar
        }}
      >
        <ImageCanvas
          src="/assets/img/ui/image-gen-placeholder.png"
          prompt={currentPrompt}
          title="First draft"
        />

        {/* Prompt input dock */}
        <ChatInputDock
          onSendMessage={handleGenerate}
          isGenerating={isGenerating}
          placeholder="Describe the image you want to generate…"
          showHint={false}
          clearOnSend={false}
        />
      </Box>

      {/* Run settings panel */}
      <ImageRunSettingsPanel />
    </Box>
  );
};

export default GenerateImagePage; 