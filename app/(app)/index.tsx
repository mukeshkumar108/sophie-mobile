import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Colors } from '@/constants/colors';
import { MicButton } from '@/components/mic-button';
import { ErrorModal } from '@/components/error-modal';
import { useVoice } from '@/hooks/use-voice';
import { useConversationContext } from '@/contexts/conversation-context';
import { TranscriptModal } from '@/components/transcript-modal';
import { AuroraBackground } from '@/components/aurora-background';

export default function MainScreen() {
  const router = useRouter();
  const { getToken, signOut } = useAuth();
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const { messages, addUserMessage, addAssistantMessage, clearMessages } =
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
    error,
    startRecording,
    stopRecording,
    clearError,
  } = useVoice({
    onTranscript: handleTranscript,
    onResponse: handleResponse,
    getToken,
  });

  const handleSignOut = async () => {
    clearMessages();
    await signOut();
  };

  const handlePressOut = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleExportTranscript = useCallback(async () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map((message) => `${message.role === 'user' ? 'You' : 'Sophie'}: ${message.content}`)
      .join('\n\n');
    try {
      await Share.share({ message: transcript });
    } catch (error) {}
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground voiceState={voiceState} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sophie</Text>
        <Pressable
          onPress={() => setIsTranscriptVisible(true)}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Transcript</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <MicButton
          voiceState={voiceState}
          onPressIn={startRecording}
          onPressOut={handlePressOut}
        />
        <Pressable onPress={() => router.push('/(app)/settings')} style={styles.settingsButton}>
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>

      <ErrorModal
        visible={voiceState === 'error'}
        error={error}
        onDismiss={clearError}
        onRetry={clearError}
        onSignIn={handleSignOut}
      />

      <TranscriptModal
        visible={isTranscriptVisible}
        messages={messages}
        onClose={() => setIsTranscriptVisible(false)}
        onExport={handleExportTranscript}
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: 0.4,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
  },
  headerButtonText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 48,
  },
  settingsButton: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  settingsText: {
    color: Colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
