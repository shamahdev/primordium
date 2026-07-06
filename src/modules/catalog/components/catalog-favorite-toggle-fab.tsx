import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import { FavoriteStarColor } from '../catalog-constants';

export const CatalogFavoriteToggleFab = React.memo(function CatalogFavoriteToggleFab({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.fab,
        { backgroundColor: theme.backgroundElement },
      ]}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Showing favorites only' : 'Show favorites only'}
      accessibilityState={{ selected: active }}
    >
      <Ionicons
        name={active ? 'star' : 'star-outline'}
        size={24}
        color={active ? FavoriteStarColor : theme.textSecondary}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
