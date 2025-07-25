import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, alpha } from '@mui/material';
import ChatMessageItem from './ChatMessageItem';
import type { ChatMessage } from '../../types/index.ts';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Brief scrollbar visibility hint when messages change
  useEffect(() => {
    const element = scrollContainerRef.current;
    if (element && messages.length > 0) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        // Check if element is scrollable and show brief hint
        if (element.scrollHeight > element.clientHeight) {
          element.classList.add('scrolling');
          setTimeout(() => {
            element.classList.remove('scrolling');
          }, 1500);
        }
      }, 100);
    }
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return null; // PromptCardGrid will be shown instead
  }

  return (
    <Box
      ref={scrollContainerRef}
      sx={{
        flexGrow: 1,
        overflow: 'auto',
        px: 3,
        pt: { xs: 9, sm: 10 }, // top padding 72px/80px to clear AppBar
        pb: 20, // bottom padding so content can scroll under input (matches existing value below)
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {/* Messages */}
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}

      {/* Loading indicator for streaming */}
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 2,
            mb: 3, // match ChatMessageItem spacing
          }}
        >
          <CircularProgress
            size={16}
            sx={{
              color: 'primary.main',
            }}
          />
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              Thinking...
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                mt: 0.5,
              }}
            >
              {/* Typing animation dots */}
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: alpha('#009688', 0.6),
                    animation: 'pulse 1.4s infinite ease-in-out',
                    animationDelay: `${i * 0.2}s`,
                    '@keyframes pulse': {
                      '0%, 80%, 100%': {
                        transform: 'scale(0.8)',
                        opacity: 0.5,
                      },
                      '40%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatMessageList; 