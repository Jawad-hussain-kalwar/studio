import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useStudioStore } from '../../../stores/studioStore';
import { useStreamingChat } from '../../../hooks/useChatApi';
import PromptCardGrid from '../../../components/studio/PromptCardGrid';
import ChatMessageList from '../../../components/studio/ChatMessageList';
import ChatInputDock from '../../../components/studio/ChatInputDock';
import RunSettingsPanel from '../../../components/studio/RunSettingsPanel';

type StreamingStatus = 'idle' | 'thinking' | 'streaming';

const ChatPlaygroundPage: React.FC = () => {
  const {
    messages,
    currentModel,
    temperature,
    topP,
    tools,
    addMessage,
    updateLastMessage,
    setTokenCount,
  } = useStudioStore();

  const [currentStreamingContent, setCurrentStreamingContent] = useState('');
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>('idle');
  const streamingMutation = useStreamingChat();
  const requestIdRef = useRef(0);

  // Derived state for backwards compatibility
  const isGenerating = streamingStatus !== 'idle';

  // Update the last message when streaming content changes
  useEffect(() => {
    if (currentStreamingContent && streamingStatus === 'streaming') {
      updateLastMessage(currentStreamingContent);
    }
  }, [currentStreamingContent, streamingStatus, updateLastMessage]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!currentModel) {
      return; // No model available
    }

    // Increment request ID to handle overlapping requests
    const currentRequestId = ++requestIdRef.current;

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

    // Set to thinking immediately when request starts
    setStreamingStatus('thinking');
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

      let isFirstChunk = true;

      await streamingMutation.mutateAsync({
        model: currentModel,
        messages: requestMessages,
        temperature,
        topP,
        tools: enabledTools,
        stream: true,
        onChunk: (chunk: string) => {
          // Only process if this is still the current request
          if (currentRequestId !== requestIdRef.current) return;

          // Switch to streaming on first chunk
          if (isFirstChunk) {
            isFirstChunk = false;
            setStreamingStatus('streaming');
          }

          setCurrentStreamingContent(prev => prev + chunk);
        },
      });

      // Only finalize if this is still the current request
      if (currentRequestId === requestIdRef.current) {
        // Mock token count update (would come from API in real implementation)
        setTokenCount({
          prompt: Math.floor(messageText.length / 4),
          completion: Math.floor(currentStreamingContent.length / 4),
          total: Math.floor((messageText.length + currentStreamingContent.length) / 4),
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      // Only handle error if this is still the current request
      if (currentRequestId === requestIdRef.current) {
        updateLastMessage('Sorry, I encountered an error while processing your request. Please try again.', true);
      }
    } finally {
      // Only reset if this is still the current request
      if (currentRequestId === requestIdRef.current) {
        setStreamingStatus('idle');
        setCurrentStreamingContent('');
      }
    }
  }, [
    messages,
    currentModel,
    temperature,
    topP,
    tools,
    addMessage,
    updateLastMessage,
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
    setStreamingStatus('idle');
    setCurrentStreamingContent('');
    // In a real implementation, you would cancel the stream request here
  }, []);

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
          height: '100%',
        }}
      >
        {/* Content that can scroll under the floating input */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', height: '100%' }}>
          {/* Show PromptCardGrid when no messages, ChatMessageList when there are messages */}
          {!currentModel ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <p>No chat models available. Please ensure Ollama is running and models are downloaded.</p>
              </Box>
            </Box>
          ) : (
            messages.length === 0 ? (
              <PromptCardGrid onPromptSelect={handlePromptSelect} />
            ) : (
              <ChatMessageList 
                messages={messages} 
                isLoading={streamingStatus === 'thinking'} 
              />
            )
          )}
        </Box>

        {/* Floating Chat Input - rendered but positioned fixed */}
        <ChatInputDock
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStop={handleStopGeneration}
          disabled={!currentModel}
        />
      </Box>

      {/* Settings Panel (Right Side) - Always visible */}
      <RunSettingsPanel />
    </Box>
  );
};

export default ChatPlaygroundPage; 