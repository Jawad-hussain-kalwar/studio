import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  InputBase,
  alpha,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  SendOutlined as SendIcon,
  StopOutlined as StopIcon,
  AttachFileOutlined as AttachFileIcon,
  CloseOutlined as CloseIcon,
} from '@mui/icons-material';

interface ChatInputDockProps {
  onSendMessage: (message: string, attachments?: FileList) => void;
  isGenerating?: boolean;
  disabled?: boolean;
  onStop?: () => void;
  placeholder?: string;
  showHint?: boolean;
  clearOnSend?: boolean;
}

const ChatInputDock: React.FC<ChatInputDockProps> = ({
  onSendMessage,
  isGenerating = false,
  disabled = false,
  onStop,
  placeholder = "Press Enter to send, Shift+Enter for new line, Ctrl+Enter to force send →|",
  showHint = false,
  clearOnSend = true,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if ((input.trim() || attachments) && !isGenerating) {
      onSendMessage(input.trim(), attachments || undefined);
      if (clearOnSend) {
        setInput('');
        setAttachments(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setAttachments(files);
    }
  };

  const removeAttachment = (index: number) => {
    if (!attachments) return;
    
    const dt = new DataTransfer();
    for (let i = 0; i < attachments.length; i++) {
      if (i !== index) {
        dt.items.add(attachments[i]);
      }
    }
    setAttachments(dt.files.length > 0 ? dt.files : null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 235, // Account for sidebar width
        right: { xs: 0, md: 320 }, // Account for RunSettingsPanel width on desktop (320px)
        p: 3,
        zIndex: 1000,
        // Make dock invisible so underlying messages remain fully visible
        backdropFilter: 'none',
        background: 'transparent',
        borderTop: 'none',
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,application/pdf,.pdf,.doc,.docx,.txt"
          style={{ display: 'none' }}
        />

        {/* Attachment previews */}
        {attachments && attachments.length > 0 && (
          <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.from(attachments).map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                size="small"
                onDelete={() => removeAttachment(index)}
                deleteIcon={<CloseIcon />}
                sx={{
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  background: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? 'rgba(18, 18, 18, 0.7)' 
                      : 'rgba(255, 255, 255, 0.7)',
                  border: (theme) => 
                    `1px solid ${theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.15)' 
                      : 'rgba(255, 255, 255, 0.3)'}`,
                }}
              />
            ))}
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            // Enhanced glassmorphism for the input container
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'rgba(18, 18, 18, 0.5)' 
                : 'rgba(255, 255, 255, 0.5)',
            border: (theme) => 
              `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.15)' 
                : 'rgba(255, 255, 255, 0.3)'}`,
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: (theme) =>
                `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}, 0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
              background: (theme) => 
                theme.palette.mode === 'dark' 
                  ? 'rgba(18, 18, 18, 0.65)' 
                  : 'rgba(255, 255, 255, 0.7)',
            },
          }}
        >
          {/* Attachment Button */}
          <IconButton
            onClick={handleFileUpload}
            disabled={disabled}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            title="Attach file"
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>

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
              fontSize: '0.9rem',
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
            disabled={(!input.trim() && !attachments && !isGenerating) || disabled}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)',
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
              transition: 'all 0.2s ease-in-out',
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

        {showHint && (
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
        )}
      </Box>
    </Box>
  );
};

export default ChatInputDock; 