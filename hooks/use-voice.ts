import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';
import { VoiceState, ErrorState, ChatResponse } from '@/types';
import { sendAudioToSophie, ApiError } from '@/services/api';
import { Config } from '@/constants/config';

// Pre-recorded filler clips — play after 1.5s of thinking to mask tool-call latency
const FILLER_CLIPS = [
  'https://aaui72motzuyoyiw.public.blob.vercel-storage.com/static/voice/filler-thinking-FSPFoHBHVubL2RDhF7XWQ0ckse0HdX.mp3',
  'https://aaui72motzuyoyiw.public.blob.vercel-storage.com/static/voice/filler-one-sec-AL13a0J0XfKZhXhj7QvswCOkv1XtbT.mp3',
  'https://aaui72motzuyoyiw.public.blob.vercel-storage.com/static/voice/filler-let-me-think-7Xc6h30D5fkOduIsPr4P04dpVf2loy.mp3',
  'https://aaui72motzuyoyiw.public.blob.vercel-storage.com/static/voice/filler-yeah-wo1QWFUhLGlrslE5NSv8hV1e71fUUo.mp3',
  'https://aaui72motzuyoyiw.public.blob.vercel-storage.com/static/voice/filler-one-moment-Qdh2jl24VCBUk1GzBhQWkBaYNd3tFs.mp3',
];

const FILLER_THRESHOLD_MS = 4000;

function randomFiller() {
  return FILLER_CLIPS[Math.floor(Math.random() * FILLER_CLIPS.length)];
}

interface UseVoiceOptions {
  onTranscript: (transcript: string) => void;
  onResponse: (response: string, audioUrl: string | null) => void;
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
  const [recordingRemainingMs, setRecordingRemainingMs] = useState<number | null>(
    null
  );

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const fillerSoundRef = useRef<Audio.Sound | null>(null);
  const fillerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartTime = useRef<number>(0);
  const maxRecordingTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const warnedTwelve = useRef(false);
  const warnedFive = useRef(false);

  useEffect(() => {
    if (voiceState !== 'idle' && voiceState !== 'error') {
      void activateKeepAwakeAsync('sophie-voice');
    } else {
      deactivateKeepAwake('sophie-voice');
    }
    return () => {
      deactivateKeepAwake('sophie-voice');
    };
  }, [voiceState]);

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

  const stopFillerAudio = useCallback(async () => {
    if (fillerTimerRef.current) {
      clearTimeout(fillerTimerRef.current);
      fillerTimerRef.current = null;
    }
    if (fillerSoundRef.current) {
      try {
        await fillerSoundRef.current.stopAsync();
        await fillerSoundRef.current.unloadAsync();
      } catch {}
      fillerSoundRef.current = null;
    }
  }, []);

  const startFillerTimer = useCallback(() => {
    if (fillerTimerRef.current) clearTimeout(fillerTimerRef.current);
    fillerTimerRef.current = setTimeout(async () => {
      fillerTimerRef.current = null;
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: randomFiller() },
          { shouldPlay: true }
        );
        fillerSoundRef.current = sound;
      } catch (err) {
        console.warn('[use-voice] filler playback failed', err);
      }
    }, FILLER_THRESHOLD_MS);
  }, []);

  const startRecording = useCallback(async () => {
    try {
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

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      recordingStartTime.current = Date.now();
      setVoiceState('recording');
      setError(null);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      maxRecordingTimeout.current = setTimeout(() => {
        stopRecording();
      }, Config.MAX_RECORDING_DURATION_MS);

      setRecordingRemainingMs(Config.MAX_RECORDING_DURATION_MS);
      warnedTwelve.current = false;
      warnedFive.current = false;
      recordingInterval.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime.current;
        const remaining = Math.max(
          Config.MAX_RECORDING_DURATION_MS - elapsed,
          0
        );
        setRecordingRemainingMs(remaining);
        if (remaining <= 12000 && !warnedTwelve.current) {
          warnedTwelve.current = true;
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        }
        if (remaining <= 5000 && !warnedFive.current) {
          warnedFive.current = true;
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }, 250);
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
    if (maxRecordingTimeout.current) {
      clearTimeout(maxRecordingTimeout.current);
      maxRecordingTimeout.current = null;
    }
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    setRecordingRemainingMs(null);
    warnedTwelve.current = false;
    warnedFive.current = false;

    if (!recordingRef.current) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const recordingDuration = Date.now() - recordingStartTime.current;

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

      setVoiceState('thinking');

      const token = await getToken();
      if (!token) {
        await stopFillerAudio();
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
        hasAudioBase64: Boolean(response.audioBase64),
      });

      onTranscript(response.transcript);
      onResponse(response.response, response.audioUrl);

      await playAudioBase64(response.audioBase64);
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
  }, [getToken, onTranscript, onResponse, startFillerTimer, stopFillerAudio]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
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

  const playAudioBase64 = useCallback(async (base64: string) => {
    try {
      setVoiceState('speaking');
      setIsAudioPlaying(false);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // expo-av supports data URIs for in-memory audio on iOS
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mpeg;base64,${base64}` },
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

  // Keep URL-based playback for replaying messages from history
  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      setVoiceState('speaking');
      setIsAudioPlaying(false);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

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
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    if (fillerTimerRef.current) {
      clearTimeout(fillerTimerRef.current);
    }
    warnedTwelve.current = false;
    warnedFive.current = false;
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
    if (fillerSoundRef.current) {
      try {
        await fillerSoundRef.current.unloadAsync();
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
    recordingRemainingMs,
  };
}
