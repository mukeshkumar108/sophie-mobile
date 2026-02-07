import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Colors } from '@/constants/colors';
import { MicButton } from '@/components/mic-button';
import { MessageBubble } from '@/components/message-bubble';
import { ErrorModal } from '@/components/error-modal';
import { useVoice } from '@/hooks/use-voice';
import { useConversationContext } from '@/contexts/conversation-context';

export default function MainScreen() {
  const router = useRouter();
  const { getToken, signOut } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, latestAssistantMessageId, addUserMessage, addAssistantMessage, clearMessages } =
    useConversationContext();

  const handleTranscript = useCallback(
    (transcript: string) => {
      addUserMessage(transcript);
    },
    [addUserMessage]
  );

  const handleResponse = useCallback(
    (response: string, audioUrl: string) => {
      addAssistantMessage(response, audioUrl);
    },
    [addAssistantMessage]
  );

  const {
    voiceState,
    isAudioPlaying,
    error,
    startRecording,
    stopRecording,
    replayAudio,
    clearError,
  } = useVoice({
    onTranscript: handleTranscript,
    onResponse: handleResponse,
    getToken,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSignOut = async () => {
    clearMessages();
    await signOut();
  };

  const handleCopyText = useCallback(async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch (error) {
      // Silently fail - toast already shown in MessageBubble
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>💬</Text>
          </View>
          <Text style={styles.headerTitle}>Sophie</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(app)/settings')}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👋</Text>
            <Text style={styles.emptyTitle}>Hey there!</Text>
            <Text style={styles.emptySubtitle}>
              Hold the button below to start talking to Sophie
            </Text>
          </View>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onReplayAudio={replayAudio}
            onCopyText={handleCopyText}
            isNew={message.id === latestAssistantMessageId}
          />
        ))}
      </ScrollView>

      <MicButton
        voiceState={voiceState}
        isAudioPlaying={isAudioPlaying}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      />

      <ErrorModal
        visible={voiceState === 'error'}
        error={error}
        onDismiss={clearError}
        onRetry={clearError}
        onSignIn={handleSignOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sophieBubble,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
