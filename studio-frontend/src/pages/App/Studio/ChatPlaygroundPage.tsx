import React, { useEffect, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { API_BASE_URL } from '../../../api/http';
import { useStudioStore } from '../../../stores/studioStore';
import { useChat } from 'ai/react';
import PromptCardGrid from '../../../components/studio/PromptCardGrid';
import ChatMessageList from '../../../components/studio/ChatMessageList';
import ChatInputDock from '../../../components/studio/ChatInputDock';
import RunSettingsPanel from '../../../components/studio/RunSettingsPanel';

const ChatPlaygroundPage: React.FC = () => {
  const {
    messages: zustandMessages,
    currentModel,
    temperature,
    topP,
    tools,
    setIsGenerating,
    setTokenCount,
  } = useStudioStore();

  // API_BASE_URL now resolved centrally
  
  console.log('🚀 ChatPlaygroundPage render:', {
    currentModel,
    temperature,
    topP,
    tools,
    API_BASE_URL,
    messagesCount: zustandMessages.length
  });

  // Memoize chat hook options to avoid new object identity on every render, which
  // leads to the "Maximum update depth exceeded" error when the hook detects
  // option changes on each streaming update.
  const chatOptions = useMemo(() => ({
    api: `${API_BASE_URL}/v1/chat/completions/`,
    streamProtocol: 'data' as const,
    body: {
      model: currentModel,
      temperature,
      top_p: topP,
      tools: Object.keys(tools).filter((key) => tools[key]),
      max_tokens: 4096,
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    onFinish: (_: any, { usage }: any) => {
      console.log('✅ Chat completed, usage:', usage);
      if (usage) {
        setTokenCount({
          prompt: usage.promptTokens,
          completion: usage.completionTokens,
          total: usage.totalTokens,
        });
      }
      setIsGenerating(false);
    },
    onError: (error: unknown) => {
      console.log('❌ Chat error:', error);
      setIsGenerating(false);
    },
    onResponse: (response: Response) => {
      console.log('📡 Chat response received:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      setIsGenerating(true);
    },
  }), [API_BASE_URL, currentModel, temperature, topP, tools, setIsGenerating, setTokenCount]);

  // Initialize chat hook with stable options reference
  const { messages, status, append } = useChat(chatOptions);

  // Handle prompt card selection
  const handlePromptSelect = useCallback((prompt: string) => {
    console.log('🎯 Prompt selected:', prompt);
    append({
      role: 'user',
      content: prompt,
    });
  }, [append]);

  // Update status when chat status changes
  useEffect(() => {
    console.log('🔄 Chat status changed:', status);
    setIsGenerating(status === 'submitted' || status === 'streaming');
  }, [status, setIsGenerating]);

  // Convert UIMessage to ChatMessage for our components
  const chatMessages = messages.map(msg => ({
    id: msg.id,
    role: msg.role === 'data' ? 'assistant' : msg.role,
    content: msg.content,
    createdAt: new Date().toISOString(),
  })) as import('../../../types/chat').ChatMessage[];

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {messages.length === 0 ? (
            <PromptCardGrid onPromptSelect={handlePromptSelect} />
          ) : (
            <ChatMessageList messages={chatMessages} />
          )}
        </Box>

        <ChatInputDock
          onSendMessage={(msg: string, attachments?: FileList) => {
            console.log('💬 onSendMessage called:', {
              message: msg,
              attachments: attachments ? Array.from(attachments).map(f => f.name) : null,
              currentModel,
              temperature,
              topP
            });
            
            append({
              role: 'user',
              content: msg,
            });
          }}
        />
      </Box>

      <RunSettingsPanel />
    </Box>
  );
};

export default ChatPlaygroundPage; 