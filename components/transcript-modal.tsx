import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Message } from '@/types';

interface TranscriptModalProps {
  visible: boolean;
  messages: Message[];
  onClose: () => void;
  onExport: () => void;
}

export function TranscriptModal({
  visible,
  messages,
  onClose,
  onExport,
}: TranscriptModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Transcript</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={onExport} style={styles.actionButton}>
                <Text style={styles.actionText}>Export</Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.actionButton}>
                <Text style={styles.actionText}>Close</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {messages.length === 0 && (
              <Text style={styles.emptyText}>No transcript yet.</Text>
            )}
            {messages.map((message) => (
              <View key={message.id} style={styles.messageRow}>
                <Text style={styles.messageRole}>
                  {message.role === 'user' ? 'You' : 'Sophie'}
                </Text>
                <Text style={styles.messageText}>{message.content}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
  },
  actionText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  messageRow: {
    gap: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  messageRole: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  messageText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
});
