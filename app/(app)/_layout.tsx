import { Stack } from 'expo-router';
import { ConversationProvider } from '@/contexts/conversation-context';

export default function AppLayout() {
  return (
    <ConversationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
      </Stack>
    </ConversationProvider>
  );
}
