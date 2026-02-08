export default {
  expo: {
    name: "Sophie",
    slug: "sophie-mobile",
    owner: "mk1080",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "sophiemobile",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.kaiserkumar.sophie",
      infoPlist: {
        NSMicrophoneUsageDescription:
          "Sophie needs microphone access to hear your voice and respond to you.",
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            "test-starter-kappa.vercel.app": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSIncludesSubdomains: true,
              NSExceptionRequiresForwardSecrecy: true,
            },
            "vercel.app": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSIncludesSubdomains: true,
              NSExceptionRequiresForwardSecrecy: true,
            },
          },
        },
      },
    },
    android: {
      package: "com.kaiserkumar.sophie",
      adaptiveIcon: {
        backgroundColor: "#F5F5F0",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F5F5F0",
        },
      ],
      "expo-secure-store",
      "expo-web-browser",
      [
        "expo-av",
        {
          microphonePermission:
            "Sophie needs microphone access to hear your voice and respond to you.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "7caaa3ea-bd1f-4350-ac8c-16e2ffd2c016",
      },
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ||
        "https://test-starter-kappa.vercel.app",
      clerkPublishableKey:
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        "pk_test_ZWxlZ2FudC1zYXdmbHktODUuY2xlcmsuYWNjb3VudHMuZGV2JA",
      sophiePersonaId:
        process.env.EXPO_PUBLIC_SOPHIE_PERSONA_ID ||
        "cmkqy75l30003y6rbd7qwtdp6",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/7caaa3ea-bd1f-4350-ac8c-16e2ffd2c016",
    },
  },
};
