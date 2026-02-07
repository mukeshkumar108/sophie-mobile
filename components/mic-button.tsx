import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { VoiceState } from '@/types';

interface MicButtonProps {
  voiceState: VoiceState;
  onPressIn: () => void;
  onPressOut: () => void;
  disabled?: boolean;
  isAudioPlaying?: boolean;
}

// Line-style microphone icon
function MicrophoneIcon({ color = Colors.white }: { color?: string }) {
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

// Line-style speaker icon for loading state
function SpeakerIcon() {
  return (
    <View style={styles.speakerIconContainer}>
      <View style={styles.speakerBody} />
      <View style={styles.speakerCone} />
      <View style={[styles.soundWave, styles.soundWave1]} />
      <View style={[styles.soundWave, styles.soundWave2]} />
    </View>
  );
}

function BouncingDots() {
  const dot1Y = useRef(new Animated.Value(0)).current;
  const dot2Y = useRef(new Animated.Value(0)).current;
  const dot3Y = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in dots
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -16,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.delay(450 - delay),
        ])
      );
    };

    const anim1 = animateDot(dot1Y, 0);
    const anim2 = animateDot(dot2Y, 150);
    const anim3 = animateDot(dot3Y, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1Y, dot2Y, dot3Y, fadeIn]);

  return (
    <Animated.View style={[styles.bouncingDotsContainer, { opacity: fadeIn }]}>
      <Animated.View
        style={[styles.bouncingDot, { transform: [{ translateY: dot1Y }] }]}
      />
      <Animated.View
        style={[styles.bouncingDot, { transform: [{ translateY: dot2Y }] }]}
      />
      <Animated.View
        style={[styles.bouncingDot, { transform: [{ translateY: dot3Y }] }]}
      />
    </Animated.View>
  );
}

function AudioWaveBars() {
  const bar1 = useRef(new Animated.Value(0.4)).current;
  const bar2 = useRef(new Animated.Value(0.7)).current;
  const bar3 = useRef(new Animated.Value(0.5)).current;
  const bar4 = useRef(new Animated.Value(0.8)).current;
  const bar5 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animateBar = (bar: Animated.Value, minVal: number, maxVal: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: maxVal,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: minVal,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      animateBar(bar1, 0.3, 1, 300),
      animateBar(bar2, 0.4, 0.9, 250),
      animateBar(bar3, 0.2, 1, 350),
      animateBar(bar4, 0.5, 0.8, 200),
      animateBar(bar5, 0.3, 0.95, 280),
    ];

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, [bar1, bar2, bar3, bar4, bar5]);

  const bars = [bar1, bar2, bar3, bar4, bar5];

  return (
    <View style={styles.waveBarsContainer}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              transform: [{ scaleY: bar }],
            },
          ]}
        />
      ))}
    </View>
  );
}

export function MicButton({
  voiceState,
  onPressIn,
  onPressOut,
  disabled = false,
  isAudioPlaying = false,
}: MicButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const morphAnim = useRef(new Animated.Value(1)).current;
  const prevVoiceState = useRef<VoiceState>(voiceState);

  // Handle morphing animation when transitioning to/from thinking state
  useEffect(() => {
    const wasThinking = prevVoiceState.current === 'thinking';
    const isThinking = voiceState === 'thinking';

    if (!wasThinking && isThinking) {
      // Entering thinking state - shrink to 70%
      Animated.spring(morphAnim, {
        toValue: 0.7,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else if (wasThinking && !isThinking) {
      // Exiting thinking state - grow back to 100%
      Animated.spring(morphAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }

    prevVoiceState.current = voiceState;
  }, [voiceState, morphAnim]);

  // Handle pulse animations based on state
  useEffect(() => {
    if (voiceState === 'idle') {
      // More noticeable idle pulse animation (5% growth)
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else if (voiceState === 'recording') {
      // More pronounced pulse for recording
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else if (voiceState === 'speaking') {
      // Gentle pulse for speaking
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else if (voiceState === 'thinking') {
      // Subtle pulse for thinking
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voiceState, pulseAnim]);

  const handlePressIn = () => {
    if (disabled || voiceState !== 'idle') return;

    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    onPressIn();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();

    if (voiceState === 'recording') {
      onPressOut();
    }
  };

  const renderContent = () => {
    switch (voiceState) {
      case 'recording':
        return <MicrophoneIcon />;
      case 'thinking':
        return <BouncingDots />;
      case 'speaking':
        return isAudioPlaying ? <AudioWaveBars /> : <SpeakerIcon />;
      case 'error':
        return <Text style={styles.icon}>⚠️</Text>;
      default:
        return <MicrophoneIcon />;
    }
  };

  const getStatusText = () => {
    switch (voiceState) {
      case 'recording':
        return 'Release to send';
      case 'thinking':
        return 'Sophie is thinking...';
      case 'speaking':
        return isAudioPlaying ? 'Sophie is speaking...' : 'Loading audio...';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Hold to talk to Sophie';
    }
  };

  const isInteractive = voiceState === 'idle' || voiceState === 'recording';

  // Combine all scale animations
  const combinedScale = Animated.multiply(
    Animated.multiply(scaleAnim, pulseAnim),
    morphAnim
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [{ scale: combinedScale }],
          },
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!isInteractive || disabled}
          style={[
            styles.button,
            voiceState === 'recording' && styles.buttonRecording,
            !isInteractive && styles.buttonDisabled,
          ]}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
      <Text style={styles.statusText}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  buttonWrapper: {
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.micButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRecording: {
    backgroundColor: Colors.error,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 64,
  },
  statusText: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  // Microphone icon styles
  micIconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHead: {
    width: 28,
    height: 36,
    borderWidth: 3,
    borderRadius: 14,
    position: 'absolute',
    top: 0,
  },
  micBody: {
    width: 42,
    height: 24,
    borderWidth: 3,
    borderTopWidth: 0,
    borderBottomLeftRadius: 21,
    borderBottomRightRadius: 21,
    position: 'absolute',
    top: 26,
  },
  micStand: {
    width: 3,
    height: 10,
    backgroundColor: Colors.white,
    position: 'absolute',
    bottom: 6,
  },
  micBase: {
    width: 24,
    height: 3,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
  },
  // Speaker icon styles (for loading state)
  speakerIconContainer: {
    width: 64,
    height: 64,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerBody: {
    position: 'absolute',
    left: 12,
    top: 22,
    width: 12,
    height: 20,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  speakerCone: {
    position: 'absolute',
    left: 20,
    top: 16,
    width: 0,
    height: 0,
    borderTopWidth: 16,
    borderBottomWidth: 16,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.white,
  },
  soundWave: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: Colors.white,
    borderLeftColor: 'transparent',
    borderRadius: 20,
  },
  soundWave1: {
    left: 38,
    top: 20,
    width: 12,
    height: 24,
  },
  soundWave2: {
    left: 46,
    top: 14,
    width: 12,
    height: 36,
  },
  bouncingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 48,
  },
  bouncingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
  },
  waveBarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 64,
  },
  waveBar: {
    width: 8,
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
});
