import Constants from 'expo-constants';

const extra =
  Constants.expoConfig?.extra ||
  Constants.manifest?.extra ||
  Constants.manifest2?.extra;

export const Config = {
  // API Configuration
  API_BASE_URL: extra?.apiUrl || "https://test-starter-kappa.vercel.app",

  // Sophie's persona ID (hardcoded)
  PERSONA_ID: extra?.sophiePersonaId || "cmkct1fjh0003y6fp8ytzbm4p",

  // Language (hardcoded)
  LANGUAGE: "en",

  // Recording limits
  MIN_RECORDING_DURATION_MS: 500,
  MAX_RECORDING_DURATION_MS: 60000,

  // Conversation limits
  MAX_MESSAGES_TO_DISPLAY: 10,

  // Clerk publishable key - replace with your actual key
  CLERK_PUBLISHABLE_KEY:
    extra?.clerkPublishableKey ||
    "pk_test_ZWxlZ2FudC1zYXdmbHktODUuY2xlcmsuYWNjb3VudHMuZGV2JA",

  // AsyncStorage keys
  STORAGE_KEYS: {
    ONBOARDING_COMPLETE: "sophie_onboarding_complete",
  },
};
