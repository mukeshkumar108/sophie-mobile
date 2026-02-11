import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  BlurMask,
  Canvas,
  Group,
  RoundedRect,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

interface RecordingWarningOverlayProps {
  remainingMs: number | null;
}

export function RecordingWarningOverlay({
  remainingMs,
}: RecordingWarningOverlayProps) {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const show = remainingMs !== null && remainingMs <= 12000;
  const pulseHard = remainingMs !== null && remainingMs <= 5000;

  const duration = useMemo(() => (pulseHard ? 420 : 900), [pulseHard]);

  if (!show) return null;

  const baseOpacity = pulseHard ? 0.5 : 0.3;
  const pulseOpacity = useDerivedValue(() => {
    const t = clock.value / duration;
    const wave = 0.5 + 0.5 * Math.sin(t);
    const amp = pulseHard ? 0.45 : 0.25;
    return baseOpacity + wave * amp;
  }, [clock, duration, baseOpacity, pulseHard]);

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Group opacity={pulseOpacity}>
        <RoundedRect
          x={8}
          y={8}
          width={width - 16}
          height={height - 16}
          r={28}
          color="rgba(255,60,60,0.65)"
          style="stroke"
          strokeWidth={10}
        >
          <BlurMask blur={16} style="normal" />
        </RoundedRect>
        <RoundedRect
          x={16}
          y={16}
          width={width - 32}
          height={height - 32}
          r={24}
          color="rgba(255,60,60,0.9)"
          style="stroke"
          strokeWidth={6}
        >
          <BlurMask blur={8} style="normal" />
        </RoundedRect>
      </Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});
