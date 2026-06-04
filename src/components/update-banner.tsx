import Ionicons from '@expo/vector-icons/Ionicons';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface UpdateBannerProps {
  version: string;
  releaseUrl: string;
  onDismiss: () => void;
}

export function UpdateBanner({ version, releaseUrl, onDismiss }: UpdateBannerProps) {
  const theme = useTheme();

  const handlePress = () => {
    void openBrowserAsync(releaseUrl, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  return (
    <View style={[styles.banner, { backgroundColor: theme.accent }]}>
      <Pressable onPress={handlePress} style={styles.content}>
        <ThemedText
          type="small"
          numberOfLines={2}
          style={[styles.text, { color: theme.accentForeground }]}
        >
          {`v${version} available \u00B7 Tap to download`}
        </ThemedText>
      </Pressable>
      <Pressable onPress={onDismiss} style={styles.dismiss} hitSlop={8}>
        <Ionicons name="close" size={18} color={theme.accentForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  dismiss: {
    padding: Spacing.one,
  },
});
