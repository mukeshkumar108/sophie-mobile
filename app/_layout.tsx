import { useEffect } from 'react';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { tokenCache } from '@/services/token-cache';
import { OnboardingProvider, useOnboarding } from '@/hooks/use-onboarding';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';

function InitialLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { hasCompletedOnboarding, isLoading: isOnboardingLoading } =
    useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || isOnboardingLoading) return;

    const inAuthGroup = segments[0] === 'sign-in';
    const inOnboarding = segments[0] === 'onboarding';
    const inApp = segments[0] === '(app)';

    console.log('[layout] route guard', {
      isSignedIn,
      hasCompletedOnboarding,
      segments,
    });

    if (!isSignedIn && !inAuthGroup) {
      // Not signed in, redirect to sign-in
      console.log('[layout] redirect -> /sign-in');
      router.replace('/sign-in');
    } else if (isSignedIn && !hasCompletedOnboarding && !inOnboarding) {
      // Signed in but hasn't completed onboarding
      console.log('[layout] redirect -> /onboarding');
      router.replace('/onboarding');
    } else if (isSignedIn && hasCompletedOnboarding && !inApp) {
      // Signed in and completed onboarding, go to main app
      console.log('[layout] redirect -> /(app)');
      router.replace('/(app)');
    }
  }, [isSignedIn, isLoaded, hasCompletedOnboarding, isOnboardingLoading, segments, router]);

  if (!isLoaded || isOnboardingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={Config.CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <OnboardingProvider>
          <InitialLayout />
        </OnboardingProvider>
        <StatusBar style="light" />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
