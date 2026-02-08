import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function OnboardingHowItWorks() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How to talk to Sophie</Text>

        <View style={styles.micIllustration}>
          <View style={styles.micCircle}>
            <Text style={styles.micIcon}>◦</Text>
          </View>
        </View>

        <View style={styles.instructions}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Hold the button</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Speak your commitment</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Release when done</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Sophie will respond and hold you accountable
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/onboarding/permissions')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 40,
    textAlign: 'center',
  },
  micIllustration: {
    marginBottom: 40,
  },
  micCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: 'rgba(92,225,230,0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  micIcon: {
    fontSize: 48,
    color: Colors.accent,
  },
  instructions: {
    gap: 20,
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepText: {
    fontSize: 16,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    gap: 24,
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
  button: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
