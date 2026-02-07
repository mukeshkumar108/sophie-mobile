import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message } from '@/types';
import { Config } from '@/constants/config';

interface ConversationContextType {
  messages: Message[];
  latestAssistantMessageId: string | null;
  addUserMessage: (content: string) => Message;
  addAssistantMessage: (content: string, audioUrl?: string) => Message;
  clearMessages: () => void;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestAssistantMessageId, setLatestAssistantMessageId] = useState<string | null>(null);

  const addUserMessage = useCallback((content: string) => {
    const message: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => {
      const updated = [...prev, message];
      if (updated.length > Config.MAX_MESSAGES_TO_DISPLAY) {
        return updated.slice(-Config.MAX_MESSAGES_TO_DISPLAY);
      }
      return updated;
    });

    return message;
  }, []);

  const addAssistantMessage = useCallback(
    (content: string, audioUrl?: string) => {
      const messageId = `assistant-${Date.now()}`;
      const message: Message = {
        id: messageId,
        role: 'assistant',
        content,
        audioUrl,
        timestamp: Date.now(),
      };

      setMessages((prev) => {
        const updated = [...prev, message];
        if (updated.length > Config.MAX_MESSAGES_TO_DISPLAY) {
          return updated.slice(-Config.MAX_MESSAGES_TO_DISPLAY);
        }
        return updated;
      });

      // Track this as the latest assistant message for typing animation
      setLatestAssistantMessageId(messageId);

      return message;
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLatestAssistantMessageId(null);
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        messages,
        latestAssistantMessageId,
        addUserMessage,
        addAssistantMessage,
        clearMessages,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      'useConversationContext must be used within a ConversationProvider'
    );
  }
  return context;
}
