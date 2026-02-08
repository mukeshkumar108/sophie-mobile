import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { VoiceState } from '@/types';

interface VoiceVisualizerProps {
  voiceState: VoiceState;
  isAudioPlaying: boolean;
}

const STATE_LABELS: Record<VoiceState, { title: string; subtitle: string }> = {
  idle: { title: 'Ready', subtitle: 'Hold to speak' },
  recording: { title: 'Listening', subtitle: 'Release to send' },
  thinking: { title: 'Thinking', subtitle: 'Interpreting your voice' },
  speaking: { title: 'Speaking', subtitle: 'Sophie is responding' },
  error: { title: 'Something went wrong', subtitle: 'Try again' },
};

export function VoiceVisualizer({ voiceState, isAudioPlaying }: VoiceVisualizerProps) {
  const glow = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const electric = useRef(new Animated.Value(0)).current;

  const labels = useMemo(() => STATE_LABELS[voiceState], [voiceState]);

  useEffect(() => {
    const speed = voiceState === 'recording' ? 500 : voiceState === 'thinking' ? 900 : 1200;
    const amplitude = voiceState === 'recording' ? 1 : voiceState === 'speaking' && isAudioPlaying ? 1 : 0.6;

    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: amplitude, duration: speed, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: speed, useNativeDriver: true }),
      ])
    );

    const ringAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: speed * 1.6, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    const electricAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(electric, { toValue: 1, duration: speed * 2, useNativeDriver: true }),
        Animated.timing(electric, { toValue: 0, duration: speed * 2, useNativeDriver: true }),
      ])
    );

    glowAnim.start();
    ringAnim.start();
    electricAnim.start();

    return () => {
      glowAnim.stop();
      ringAnim.stop();
      electricAnim.stop();
    };
  }, [glow, ring, electric, voiceState, isAudioPlaying]);

  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const ringScale = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const ringOpacity = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  const electricSpin = electric.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const electricOpacity = electric.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.7],
  });

  const electricScale = electric.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const electricIntensity =
    voiceState === 'recording' || (voiceState === 'speaking' && isAudioPlaying)
      ? 1
      : voiceState === 'thinking'
        ? 0.6
        : 0.35;

  const electricOpacityScaled = Animated.multiply(
    electricOpacity,
    electricIntensity
  );

  return (
    <View style={styles.container}>
      <View style={styles.orbWrapper}>
        <Animated.View
          style={[
            styles.orbGlow,
            {
              transform: [{ scale: glowScale }],
              opacity: voiceState === 'error' ? 0.2 : 1,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orbGlowSoft,
            {
              transform: [{ scale: glowScale }],
              opacity: voiceState === 'error' ? 0.2 : 1,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orbRing,
            {
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.electricRing,
            {
              opacity: electricOpacityScaled,
              transform: [{ rotate: electricSpin }, { scale: electricScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.electricRingSoft,
            { opacity: electricIntensity },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            {
              opacity: voiceState === 'error' ? 0.5 : 1,
            },
          ]}
        />
      </View>
      <Text style={styles.title}>{labels.title}</Text>
      <Text style={styles.subtitle}>{labels.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  orbWrapper: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  orb: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  orbGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.accent,
    opacity: 0.08,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 45,
  },
  orbGlowSoft: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.accent,
    opacity: 0.05,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 70,
  },
  orbRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 0.6,
    borderColor: 'rgba(92,225,230,0.35)',
  },
  electricRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 0.6,
    borderColor: 'rgba(92,225,230,0.7)',
  },
  electricRingSoft: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(92,225,230,0.2)',
    shadowColor: 'rgba(92,225,230,0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
