import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface PhaseCardProps {
  title: string;
  text: string;
}

export function PhaseCard({ title, text }: PhaseCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  text: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
