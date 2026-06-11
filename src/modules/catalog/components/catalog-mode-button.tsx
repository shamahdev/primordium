import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/commons/components/themed-text';
import { Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import type { CatalogMode } from '../catalog-type';

export const CatalogModeButton = React.memo(function CatalogModeButton({
  label,
  mode,
  selected,
  onPress,
}: {
  label: string;
  mode: CatalogMode;
  selected: boolean;
  onPress: (mode: CatalogMode) => void;
}) {
  const theme = useTheme();
  const handlePress = React.useCallback(() => onPress(mode), [mode, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.modeButton,
        { backgroundColor: selected ? theme.primary : 'transparent' },
      ]}>
      <ThemedText type="smallBold" style={{ color: selected ? theme.primaryForeground : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  modeButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Spacing.one,
    paddingVertical: Spacing.two,
  },
});
