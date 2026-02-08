import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { ErrorState } from '@/types';

interface ErrorModalProps {
  visible: boolean;
  error: ErrorState | null;
  onDismiss: () => void;
  onRetry?: () => void;
  onSignIn?: () => void;
}

export function ErrorModal({
  visible,
  error,
  onDismiss,
  onRetry,
  onSignIn,
}: ErrorModalProps) {
  if (!error) return null;

  const isAuthError = error.requestId === 'no-token' || error.message.toLowerCase().includes('unauthorized');
  const isTooShort = error.requestId === 'too-short';

  const getActionButton = () => {
    if (isAuthError && onSignIn) {
      return (
        <Pressable style={styles.primaryButton} onPress={onSignIn}>
          <Text style={styles.primaryButtonText}>Sign In Again</Text>
        </Pressable>
      );
    }
    if (onRetry) {
      return (
        <Pressable style={styles.primaryButton} onPress={onRetry}>
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </Pressable>
      );
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.message}>{error.message}</Text>

          {error.requestId && !isTooShort && error.requestId !== 'no-token' && (
            <View style={styles.requestIdContainer}>
              <Text style={styles.requestIdLabel}>Request ID:</Text>
              <Text style={styles.requestId} selectable>{error.requestId}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {getActionButton()}
            <Pressable style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  requestIdContainer: {
    backgroundColor: Colors.surfaceAlt,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  requestIdLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  requestId: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
