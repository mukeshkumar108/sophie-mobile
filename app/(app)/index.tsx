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
import { RecordingWarningOverlay } from '@/components/recording-warning-overlay';
import { closeSession } from '@/services/api';
import * as Haptics from 'expo-haptics';

export default function MainScreen() {
  const router = useRouter();
  const { getToken, signOut } = useAuth();
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [endSessionState, setEndSessionState] = useState<'idle' | 'loading' | 'done'>('idle');
  const { messages, addUserMessage, addAssistantMessage, clearMessages } =
    useConversationContext();

  const handleTranscript = useCallback(
    (transcript: string) => {
      addUserMessage(transcript);
    },
    [addUserMessage]
  );

  const handleResponse = useCallback(
    (response: string, audioUrl: string | null) => {
      addAssistantMessage(response, audioUrl ?? undefined);
    },
    [addAssistantMessage]
  );

  const {
    voiceState,
    isAudioPlaying,
    error,
    startRecording,
    stopRecording,
    clearError,
    recordingRemainingMs,
  } = useVoice({
    onTranscript: handleTranscript,
    onResponse: handleResponse,
    getToken,
  });

  const handleSignOut = async () => {
    clearMessages();
    await signOut();
  };

  const handleEndSession = useCallback(async () => {
    if (endSessionState !== 'idle') return;
    setEndSessionState('loading');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const token = await getToken();
      if (token) await closeSession(token);
      clearMessages();
      setEndSessionState('done');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setEndSessionState('idle'), 1500);
    } catch (err) {
      console.warn('[end-session] failed', err);
      setEndSessionState('idle');
    }
  }, [getToken, clearMessages, endSessionState]);

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
    } catch {}
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground voiceState={voiceState} isAudioPlaying={isAudioPlaying} />
      <RecordingWarningOverlay remainingMs={recordingRemainingMs} />
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
        <View style={styles.footerLinks}>
          <Pressable
            onPress={handleEndSession}
            disabled={endSessionState !== 'idle'}
            style={styles.footerLinkButton}
          >
            <Text style={[
              styles.footerLinkText,
              endSessionState === 'done' && styles.footerLinkTextDone,
            ]}>
              {endSessionState === 'loading' ? 'Ending...' : endSessionState === 'done' ? 'Done' : 'End session'}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(app)/settings')} style={styles.footerLinkButton}>
            <Text style={styles.footerLinkText}>Settings</Text>
          </Pressable>
        </View>
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
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  footerLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  footerLinkText: {
    color: Colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  footerLinkTextDone: {
    color: Colors.text,
  },
});
