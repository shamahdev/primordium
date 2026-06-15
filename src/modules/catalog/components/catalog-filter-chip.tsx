import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/commons/components/themed-text';
import { Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import type { CatalogFilter } from '../catalog-type';

export const CatalogFilterChip = React.memo(function CatalogFilterChip({
  label,
  selected,
  type,
  onPress,
}: {
  label: string;
  selected: boolean;
  type: CatalogFilter;
  onPress: (type: CatalogFilter) => void;
}) {
  const theme = useTheme();
  const handlePress = React.useCallback(() => onPress(type), [onPress, type]);
  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.backgroundSelected,
        },
      ]}>
      <ThemedText type="xsmall" style={{ color: selected ? theme.primaryForeground : theme.text }}>
        {label.at(0)?.toUpperCase() + label.slice(1)}
      </ThemedText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    textTransform: 'capitalize',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
