import type { PropsWithChildren, ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';

interface ScreenScaffoldProps extends PropsWithChildren {
  title: string;
  description?: string;
  action?: ReactNode;
  contentStyle?: ViewStyle;
}

export function ScreenScaffold({
  title,
  description,
  action,
  children,
  contentStyle,
}: ScreenScaffoldProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
          </View>
          {action}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
