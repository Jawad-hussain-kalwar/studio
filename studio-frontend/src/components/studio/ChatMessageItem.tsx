import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  alpha,
} from '@mui/material';
import {
  ContentCopyOutlined as CopyIcon,
  ThumbUpOutlined as ThumbUpIcon,
  ThumbDownOutlined as ThumbDownIcon,
} from '@mui/icons-material';
import type { ChatMessage } from '../../types/index.ts';

interface ChatMessageItemProps {
  message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  // Do not render messages that have no content (e.g. assistant placeholder before streaming starts)
  if (!message.content || message.content.trim() === '') {
    return null;
  }

  if (isSystem) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontStyle: 'italic',
            px: 2,
            py: 1,
            bgcolor: alpha('#009688', 0.05),
            borderRadius: 1,
          }}
        >
          {message.content}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        mb: 3,
      }}
    >
      {/* Message Bubble */}
      <Box
        sx={{
          maxWidth: '70%',
          minWidth: '200px',
          ml: isUser ? 'auto' : 0,
        }}
      >
        {/* Message Content */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser ? alpha('#009688', 0.1) : 'background.paper',
            border: '1px solid',
            borderColor: isUser ? alpha('#009688', 0.2) : 'divider',
            borderRadius: 2,
            position: 'relative',
            ...(message.error && {
              borderColor: 'error.main',
              bgcolor: alpha('#f44336', 0.05),
            }),
          }}
        >
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: message.error ? 'error.main' : 'text.primary',
            }}
          >
            {message.content}
          </Typography>

          {/* Function Call Display */}
          {message.functionCall && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: alpha('#009688', 0.05),
                borderRadius: 1,
                border: '1px solid',
                borderColor: alpha('#009688', 0.2),
              }}
            >
              <Typography variant="caption" color="primary" fontWeight={600}>
                Function Call: {message.functionCall.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'text.secondary',
                }}
              >
                {JSON.stringify(message.functionCall.arguments, null, 2)}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Message Actions */}
        {isAssistant && !message.error && (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              mt: 1,
              opacity: 0.7,
              '&:hover': { opacity: 1 },
            }}
          >
            <IconButton size="small" onClick={handleCopy} title="Copy message">
              <CopyIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" title="Good response">
              <ThumbUpIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" title="Bad response">
              <ThumbDownIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Timestamp */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.7rem',
            mt: 0.5,
            display: 'block',
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessageItem; 