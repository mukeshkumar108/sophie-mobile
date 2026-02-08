import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/colors';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuth();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Google OAuth error:', err);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startAppleOAuth();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Apple OAuth error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>◦</Text>
        <Text style={styles.title}>Welcome to Sophie</Text>
        <Text style={styles.subtitle}>
          Your AI accountability partner who won't let you bullshit yourself
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.appleButton} onPress={handleAppleSignIn}>
          <Text style={styles.appleButtonText}> Continue with Apple</Text>
        </Pressable>

        <Pressable style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable>
      </View>

      <Text style={styles.terms}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  icon: {
    fontSize: 48,
    marginBottom: 20,
    color: Colors.accent,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  appleButton: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appleButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  terms: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
});
