import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  InputBase,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Stop as StopIcon,
} from '@mui/icons-material';

interface ChatInputDockProps {
  onSendMessage: (message: string) => void;
  isGenerating?: boolean;
  disabled?: boolean;
  onStop?: () => void;
  placeholder?: string;
}

const ChatInputDock: React.FC<ChatInputDockProps> = ({
  onSendMessage,
  isGenerating = false,
  disabled = false,
  onStop,
  placeholder = "Teach me a lesson on quadratic equations. Assume I know absolutely nothing about it. →|",
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        handleSubmit();
      } else if (!e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        p: 3,
        bgcolor: 'background.default',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 10,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper
          elevation={2}
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1,
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            transition: 'border-color 0.2s',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: (theme) =>
                `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          }}
        >
          {/* Text Input */}
          <InputBase
            ref={textareaRef}
            multiline
            maxRows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            sx={{
              flexGrow: 1,
              px: 2,
              py: 1.5,
              fontSize: '1rem',
              lineHeight: 1.5,
              '& .MuiInputBase-input': {
                resize: 'none',
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.8,
                },
              },
            }}
            inputProps={{
              'aria-label': 'Type your message',
            }}
          />

          {/* Send/Stop Button */}
          <IconButton
            onClick={isGenerating ? handleStop : handleSubmit}
            disabled={(!input.trim() && !isGenerating) || disabled}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
              '&:not(:disabled)': {
                '&:hover': {
                  bgcolor: alpha('#CDDC39', 0.9), // Lime-yellow on hover
                  color: 'rgba(0,0,0,0.87)',
                },
              },
            }}
            title={isGenerating ? 'Stop generating' : 'Send message (Enter)'}
          >
            {isGenerating ? (
              onStop ? <StopIcon fontSize="small" /> : <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </IconButton>
        </Paper>

        {/* Hint Text */}
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Box
            component="span"
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              opacity: 0.7,
            }}
          >
            Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for new line, <strong>Ctrl+Enter</strong> to force send
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInputDock; 