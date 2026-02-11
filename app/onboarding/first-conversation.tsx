import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Colors } from '@/constants/colors';
import { MicButton } from '@/components/mic-button';
import { ErrorModal } from '@/components/error-modal';
import { useVoice } from '@/hooks/use-voice';
import { useConversation } from '@/hooks/use-conversation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { AuroraBackground } from '@/components/aurora-background';
import { RecordingWarningOverlay } from '@/components/recording-warning-overlay';

export default function OnboardingFirstConversation() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { completeOnboarding } = useOnboarding();
  const { messages, addUserMessage, addAssistantMessage } = useConversation();

  const handleTranscript = useCallback(
    (transcript: string) => {
      addUserMessage(transcript);
    },
    [addUserMessage]
  );

  const handleResponse = useCallback(
    async (response: string, audioUrl: string) => {
      addAssistantMessage(response, audioUrl);
      // Mark onboarding as complete after first successful conversation
      await completeOnboarding();
      console.log('[onboarding] completeOnboarding called after response');
    },
    [addAssistantMessage, completeOnboarding]
  );

  const {
    voiceState,
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

  const handlePressOut = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Navigate to main app after successful conversation and audio finishes
  useEffect(() => {
    if (messages.length >= 2 && voiceState === 'idle') {
      console.log('[onboarding] ready to navigate to app', {
        messages: messages.length,
        voiceState,
      });
      // Give a moment for the user to see the response
      const timer = setTimeout(() => {
        router.replace('/(app)');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [messages.length, voiceState, router]);

  return (
    <View style={styles.container}>
      <AuroraBackground voiceState={voiceState} />
      <RecordingWarningOverlay remainingMs={recordingRemainingMs} />
      <View style={styles.header}>
        <Text style={styles.title}>Try talking to Sophie</Text>
        <Text style={styles.subtitle}>
          Hold to speak a commitment. Example:{'\n'}
          “I want to start walking every morning at 7am.”
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        <MicButton
          voiceState={voiceState}
          onPressIn={startRecording}
          onPressOut={handlePressOut}
        />
      </View>

      <ErrorModal
        visible={voiceState === 'error'}
        error={error}
        onDismiss={clearError}
        onRetry={clearError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 72,
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingBottom: 48,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.text,
    width: 24,
  },
});
