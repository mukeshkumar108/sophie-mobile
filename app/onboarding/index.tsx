import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>◦</Text>
        <Text style={styles.title}>Meet Sophie</Text>
        <Text style={styles.subtitle}>
          Your AI accountability partner who won't let you bullshit yourself
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/onboarding/how-it-works')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
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
    paddingTop: 120,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
    marginBottom: 28,
    color: Colors.accent,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
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
