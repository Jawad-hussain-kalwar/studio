import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { useStudioStore } from '../../../stores/studioStore';
import { useStreamingChat } from '../../../hooks/useChatApi';
import PromptCardGrid from '../../../components/studio/PromptCardGrid';
import ChatMessageList from '../../../components/studio/ChatMessageList';
import ChatInputDock from '../../../components/studio/ChatInputDock';
import RunSettingsPanel from '../../../components/studio/RunSettingsPanel';

const ChatPlaygroundPage: React.FC = () => {
  const {
    messages,
    currentModel,
    temperature,
    topP,
    tools,
    isGenerating,
    addMessage,
    updateLastMessage,
    setIsGenerating,
    setTokenCount,
  } = useStudioStore();

  const [currentStreamingContent, setCurrentStreamingContent] = useState('');
  const streamingMutation = useStreamingChat();

  // Handle sending a message
  const handleSendMessage = useCallback(async (messageText: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content: messageText,
    });

    // Add placeholder assistant message
    addMessage({
      role: 'assistant',
      content: '',
    });

    setIsGenerating(true);
    setCurrentStreamingContent('');

    try {
      // Create the API request
      const requestMessages = [
        ...messages,
        {
          id: `temp-${Date.now()}`,
          role: 'user' as const,
          content: messageText,
          createdAt: new Date().toISOString(),
        },
      ];

      // Get enabled tools
      const enabledTools = Object.entries(tools)
        .filter(([_, enabled]) => enabled)
        .map(([toolName, _]) => toolName);

      await streamingMutation.mutateAsync({
        model: currentModel,
        messages: requestMessages,
        temperature,
        topP,
        tools: enabledTools,
        stream: true,
        onChunk: (chunk: string) => {
          setCurrentStreamingContent(prev => {
            const newContent = prev + chunk;
            updateLastMessage(newContent);
            return newContent;
          });
        },
      });

      // Mock token count update (would come from API in real implementation)
      setTokenCount({
        prompt: Math.floor(messageText.length / 4),
        completion: Math.floor(currentStreamingContent.length / 4),
        total: Math.floor((messageText.length + currentStreamingContent.length) / 4),
      });

    } catch (error) {
      console.error('Chat error:', error);
      updateLastMessage('Sorry, I encountered an error. Please try again.');
      
      // Update the last message to show error state
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        addMessage({
          ...lastMessage,
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
          error: true,
        });
      }
    } finally {
      setIsGenerating(false);
      setCurrentStreamingContent('');
    }
  }, [
    messages,
    currentModel,
    temperature,
    topP,
    tools,
    addMessage,
    updateLastMessage,
    setIsGenerating,
    setTokenCount,
    streamingMutation,
    currentStreamingContent,
  ]);

  // Handle prompt card selection
  const handlePromptSelect = useCallback((prompt: string) => {
    handleSendMessage(prompt);
  }, [handleSendMessage]);

  // Handle stopping generation
  const handleStopGeneration = useCallback(() => {
    setIsGenerating(false);
    // In a real implementation, you would cancel the stream request here
  }, [setIsGenerating]);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Main Content Area (Left Side) */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Show PromptCardGrid when no messages, ChatMessageList when there are messages */}
        {messages.length === 0 ? (
          <PromptCardGrid onPromptSelect={handlePromptSelect} />
        ) : (
          <ChatMessageList messages={messages} isLoading={isGenerating} />
        )}

        {/* Chat Input - always visible */}
        <ChatInputDock
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStop={handleStopGeneration}
        />
      </Box>

      {/* Settings Panel (Right Side) - Always visible */}
      <RunSettingsPanel />
    </Box>
  );
};

export default ChatPlaygroundPage; 