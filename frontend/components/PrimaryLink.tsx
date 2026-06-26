import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/colors';

interface PrimaryLinkProps {
  href: Href;
  label: string;
}

export function PrimaryLink({ href, label }: PrimaryLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.button}>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
