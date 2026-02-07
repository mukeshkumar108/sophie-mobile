import { useState, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { VoiceState, ErrorState, ChatResponse } from '@/types';
import { sendAudioToSophie, ApiError } from '@/services/api';
import { Config } from '@/constants/config';

interface UseVoiceOptions {
  onTranscript: (transcript: string) => void;
  onResponse: (response: string, audioUrl: string) => void;
  getToken: () => Promise<string | null>;
}

export function useVoice({
  onTranscript,
  onResponse,
  getToken,
}: UseVoiceOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingStartTime = useRef<number>(0);
  const maxRecordingTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.error('Error requesting mic permission:', err);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.error('Error checking mic permission:', err);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Check permission first
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setError({
            message: 'Microphone permission denied',
            requestId: 'permission-denied',
          });
          setVoiceState('error');
          return;
        }
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      recordingStartTime.current = Date.now();
      setVoiceState('recording');
      setError(null);

      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Set max recording timeout
      maxRecordingTimeout.current = setTimeout(() => {
        stopRecording();
      }, Config.MAX_RECORDING_DURATION_MS);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError({
        message: 'Failed to start recording',
        requestId: 'recording-start-error',
      });
      setVoiceState('error');
    }
  }, [checkPermission, requestPermission]);

  const stopRecording = useCallback(async () => {
    // Clear max recording timeout
    if (maxRecordingTimeout.current) {
      clearTimeout(maxRecordingTimeout.current);
      maxRecordingTimeout.current = null;
    }

    if (!recordingRef.current) {
      return;
    }

    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const recordingDuration = Date.now() - recordingStartTime.current;

      // Check if recording is too short
      if (recordingDuration < Config.MIN_RECORDING_DURATION_MS) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
        setError({
          message: 'Hold button longer to record',
          requestId: 'too-short',
        });
        setVoiceState('error');
        return;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        setError({
          message: 'No audio recorded',
          requestId: 'no-audio',
        });
        setVoiceState('error');
        return;
      }

      // Send to API
      setVoiceState('thinking');

      const token = await getToken();
      if (!token) {
        setError({
          message: 'Please sign in again',
          requestId: 'no-token',
        });
        setVoiceState('error');
        return;
      }

      const response: ChatResponse = await sendAudioToSophie(uri, token);
      console.log('[use-voice] response received', {
        hasTranscript: Boolean(response.transcript),
        hasAudioUrl: Boolean(response.audioUrl),
      });

      // Add messages to conversation
      onTranscript(response.transcript);
      onResponse(response.response, response.audioUrl);

      // Play Sophie's audio response
      await playAudio(response.audioUrl);
    } catch (err) {
      console.error('Error processing recording:', err);

      if (err instanceof ApiError) {
        setError({
          message: err.message,
          requestId: err.requestId,
        });
      } else {
        setError({
          message: 'Something went wrong',
          requestId: 'unknown-error',
        });
      }
      setVoiceState('error');
    }
  }, [getToken, onTranscript, onResponse]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Track when audio is actually playing
      if (status.isPlaying && !status.didJustFinish) {
        setIsAudioPlaying(true);
      }

      if (status.didJustFinish) {
        console.log('[use-voice] playback finished', {
          positionMillis: status.positionMillis,
          durationMillis: status.durationMillis,
        });
        setIsAudioPlaying(false);
        setVoiceState('idle');
      }
    }
  }, []);

  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      console.log('[use-voice] playAudio start', { audioUrl });
      setVoiceState('speaking');
      setIsAudioPlaying(false); // Will be set true when actually playing

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsAudioPlaying(false);
      setVoiceState('idle');
    }
  }, [onPlaybackStatusUpdate]);

  const replayAudio = useCallback(
    async (audioUrl: string) => {
      await playAudio(audioUrl);
    },
    [playAudio]
  );

  const stopAudio = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsAudioPlaying(false);
      setVoiceState('idle');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setVoiceState('idle');
  }, []);

  const cleanup = useCallback(async () => {
    if (maxRecordingTimeout.current) {
      clearTimeout(maxRecordingTimeout.current);
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {}
    }
  }, []);

  return {
    voiceState,
    isAudioPlaying,
    error,
    permissionGranted,
    requestPermission,
    checkPermission,
    startRecording,
    stopRecording,
    replayAudio,
    stopAudio,
    clearError,
    cleanup,
  };
}
