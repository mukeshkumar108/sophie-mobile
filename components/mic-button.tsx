import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import { VoiceState } from '@/types';

interface MicButtonProps {
  voiceState: VoiceState;
  onPressIn: () => void;
  onPressOut: () => void;
  disabled?: boolean;
}

// Line-style microphone icon
function MicrophoneIcon({ color = Colors.text }: { color?: string }) {
  return (
    <View style={styles.micIconContainer}>
      {/* Mic body */}
      <View style={[styles.micBody, { borderColor: color }]} />
      {/* Mic head */}
      <View style={[styles.micHead, { borderColor: color, backgroundColor: 'transparent' }]} />
      {/* Mic stand */}
      <View style={[styles.micStand, { borderColor: color }]} />
      {/* Mic base */}
      <View style={[styles.micBase, { backgroundColor: color }]} />
    </View>
  );
}

export function MicButton({
  voiceState,
  onPressIn,
  onPressOut,
  disabled = false,
}: MicButtonProps) {
  const thinkingPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (voiceState === 'thinking') {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingPulse, {
            toValue: 0.55,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(thinkingPulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
    thinkingPulse.setValue(1);
  }, [voiceState, thinkingPulse]);
  const handlePressIn = () => {
    if (disabled || voiceState !== 'idle') return;
    onPressIn();
  };

  const handlePressOut = () => {
    if (voiceState === 'recording') {
      onPressOut();
    }
  };

  const getLabel = () => {
    switch (voiceState) {
      case 'recording':
        return 'Recording…';
      case 'thinking':
        return 'Thinking…';
      case 'speaking':
        return 'Speaking…';
      case 'error':
        return 'Try again';
      default:
        return 'Hold to talk';
    }
  };

  const isInteractive = voiceState === 'idle' || voiceState === 'recording';
  const isIdle = voiceState === 'idle';
  const isRecording = voiceState === 'recording';
  const showPill = voiceState === 'idle' || voiceState === 'recording';
  const isSecondaryLabel =
    voiceState === 'thinking' || voiceState === 'speaking';

  return (
    <View style={styles.container}>
      {showPill ? (
        <View style={styles.pillWrap}>
          {isRecording && <View style={styles.recordingGlow} />}
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!isInteractive || disabled}
            style={({ pressed }) => [
              styles.pill,
              !isIdle && styles.pillActive,
              !isInteractive && styles.pillDisabled,
              pressed && styles.pillPressed,
            ]}
          >
            <MicrophoneIcon color={Colors.text} />
            <Text style={styles.pillText}>{getLabel()}</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.Text
          style={[
            styles.stateLabel,
            isSecondaryLabel && styles.stateLabelSecondary,
            { opacity: thinkingPulse },
          ]}
        >
          {getLabel()}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  pillWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingGlow: {
    position: 'absolute',
    width: 220,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(92,225,230,0.25)',
    shadowColor: 'rgba(92,225,230,0.9)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  pillActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pillPressed: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    shadowColor: 'rgba(92,225,230,0.45)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  pillDisabled: {
    opacity: 0.6,
  },
  pillText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  stateLabel: {
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  stateLabelSecondary: {
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  // Microphone icon styles
  micIconContainer: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHead: {
    width: 8,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
  },
  micBody: {
    width: 12,
    height: 8,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    position: 'absolute',
    top: 10,
  },
  micStand: {
    width: 1.5,
    height: 4,
    backgroundColor: Colors.text,
    position: 'absolute',
    bottom: 3,
  },
  micBase: {
    width: 10,
    height: 1.5,
    borderRadius: 2,
    position: 'absolute',
    bottom: 1,
  },
});
