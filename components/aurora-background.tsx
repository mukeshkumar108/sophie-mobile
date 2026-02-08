import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Circle,
  RadialGradient,
  BlurMask,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { VoiceState } from '@/types';

interface AuroraBackgroundProps {
  voiceState: VoiceState;
}

export function AuroraBackground({ voiceState }: AuroraBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const mode = useMemo(() => voiceState, [voiceState]);
  const isOrbiting = useMemo(
    () => voiceState === 'speaking' || voiceState === 'recording',
    [voiceState]
  );

  const intensity = useMemo(() => {
    if (voiceState === 'speaking') return 1.8;
    if (voiceState === 'recording') return 1.3;
    if (voiceState === 'thinking') return 1.05;
    return 0.95;
  }, [voiceState]);

  const sizeBoost = useMemo(() => {
    if (voiceState === 'speaking') return 1.35;
    if (voiceState === 'recording') return 1.18;
    if (voiceState === 'thinking') return 1.22;
    return 1.2;
  }, [voiceState]);

  const pulseSpeed = useMemo(() => {
    if (voiceState === 'speaking') return 420;
    if (voiceState === 'recording') return 700;
    if (voiceState === 'thinking') return 1500;
    return 1100;
  }, [voiceState]);

  const pulse = useDerivedValue(() => {
    const t = clock.value / pulseSpeed;
    return 0.5 + 0.5 * Math.sin(t);
  }, [clock, pulseSpeed, mode]);

  const thinkingPulse = useDerivedValue(() => {
    // Heartbeat-like: quick spike, deeper dip, short pause
    const period = 2100;
    const phase = (clock.value % period) / period;
    if (phase < 0.18) {
      return 0.35 + 0.9 * (phase / 0.18);
    }
    if (phase < 0.28) {
      return 1.25 - 0.7 * ((phase - 0.18) / 0.1);
    }
    if (phase < 0.6) {
      return 0.55;
    }
    if (phase < 0.85) {
      return 0.55 + 0.25 * ((phase - 0.6) / 0.25);
    }
    return 0.8;
  }, [clock, mode]);

  const pulseValue = useDerivedValue(() => {
    return mode === 'thinking' ? thinkingPulse.value : pulse.value;
  }, [mode, pulse, thinkingPulse]);

  const coreRadius = useDerivedValue(() => {
    return width * (0.34 + 0.08 * pulseValue.value * intensity) * sizeBoost;
  }, [width, intensity, sizeBoost, pulseValue]);

  const haloRadius = useDerivedValue(() => {
    return width * (0.48 + 0.1 * pulseValue.value * intensity) * sizeBoost;
  }, [width, intensity, sizeBoost, pulseValue]);

  const center = useDerivedValue(() => {
    return {
      x: width * 0.5,
      y: height * 0.45,
    };
  }, [width, height]);

  const orbitAmp = useMemo(() => {
    if (voiceState === 'speaking') return 190;
    if (voiceState === 'recording') return 110;
    if (voiceState === 'thinking') return 40;
    return 24;
  }, [voiceState]);

  const orbitSpeed = useMemo(() => {
    if (voiceState === 'speaking') return 360;
    if (voiceState === 'recording') return 620;
    if (voiceState === 'thinking') return 1800;
    return 2600;
  }, [voiceState]);

  const flowAmp = useMemo(() => {
    if (voiceState === 'thinking') return 70;
    return 190;
  }, [voiceState]);

  const flowSpeed = useMemo(() => {
    if (voiceState === 'thinking') return 3200;
    return 1500;
  }, [voiceState]);

  const flowOne = useDerivedValue(() => {
    const t = clock.value / flowSpeed;
    return {
      x: width * 0.5 + Math.sin(t) * flowAmp + Math.sin(t * 2.2) * 12,
      y: height * 0.45 + Math.cos(t * 0.9) * flowAmp * 0.6 + Math.cos(t * 1.7) * 10,
    };
  }, [width, height, flowSpeed, flowAmp]);

  const flowTwo = useDerivedValue(() => {
    const t = clock.value / flowSpeed + 1.7;
    return {
      x: width * 0.5 + Math.sin(t * 0.8) * (flowAmp * 0.8) + Math.sin(t * 1.9) * 8,
      y: height * 0.48 + Math.cos(t * 0.7) * (flowAmp * 0.6) + Math.cos(t * 1.4) * 8,
    };
  }, [width, height, flowSpeed, flowAmp]);

  const orbitOne = useDerivedValue(() => {
    const angle = clock.value / orbitSpeed;
    return {
      x: width * 0.5 + Math.cos(angle) * orbitAmp,
      y: height * 0.45 + Math.sin(angle) * orbitAmp * 0.6,
    };
  }, [width, height, orbitSpeed, orbitAmp]);

  const orbitTwo = useDerivedValue(() => {
    const angle = clock.value / orbitSpeed + Math.PI;
    return {
      x: width * 0.5 + Math.cos(angle) * (orbitAmp * 0.7),
      y: height * 0.45 + Math.sin(angle) * (orbitAmp * 0.5),
    };
  }, [width, height, orbitSpeed, orbitAmp]);

  const haloCenter = useDerivedValue(() => {
    return isOrbiting ? orbitOne.value : flowOne.value;
  }, [isOrbiting, orbitOne, flowOne]);

  const accentCenter = useDerivedValue(() => {
    return isOrbiting ? orbitTwo.value : flowTwo.value;
  }, [isOrbiting, orbitTwo, flowTwo]);



  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Circle c={haloCenter} r={haloRadius} opacity={0.85 * intensity}>
        <RadialGradient
          c={haloCenter}
          r={haloRadius}
          colors={['rgba(208,98,255,0.6)', 'rgba(11,13,18,0)']}
        />
        <BlurMask blur={60} style="normal" />
      </Circle>

      <Circle c={center} r={coreRadius} opacity={1 * intensity}>
        <RadialGradient
          c={center}
          r={coreRadius}
          colors={['rgba(92,225,230,0.7)', 'rgba(11,13,18,0)']}
        />
        <BlurMask blur={50} style="normal" />
      </Circle>

      <Circle c={accentCenter} r={width * 0.24 * sizeBoost} opacity={0.55 * intensity}>
        <RadialGradient
          c={accentCenter}
          r={width * 0.24}
          colors={['rgba(122,122,255,0.55)', 'rgba(11,13,18,0)']}
        />
        <BlurMask blur={30} style="normal" />
      </Circle>

    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});
