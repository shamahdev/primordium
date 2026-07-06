import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/commons/components/themed-text';
import { Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import type { MatchCard } from '../companion-type';

export function MatchCarousel({ matches, loading }: { matches: MatchCard[]; loading: boolean }) {
  if (loading && matches.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText type="small" themeColor="textSecondary">Loading recent matches…</ThemedText>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText type="small" themeColor="textSecondary">No recent matches found.</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={matches}
      keyExtractor={(item) => item.matchId}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContent}
      renderItem={({ item }) => <MatchCardView card={item} />}
    />
  );
}

function MatchCardView({ card }: { card: MatchCard }) {
  const theme = useTheme();
  const winLabel = card.won === null ? '—' : card.won ? 'WIN' : 'LOSS';
  const winColor = card.won === null ? theme.textSecondary : card.won ? '#6ae2af' : '#e2616a';

  return (
    <Pressable style={({ pressed }) => [styles.card, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}>
      {card.mapSplash ? (
        <Image source={card.mapSplash} style={styles.mapSplash} contentFit="cover" />
      ) : null}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <ThemedText type="xsmall" themeColor="textSecondary" style={styles.queueLabel}>
            {card.queueType.toUpperCase()}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: winColor }}>{winLabel}</ThemedText>
        </View>
        <View style={styles.agentRow}>
          {card.agentIcon ? (
            <Image source={card.agentIcon} style={styles.agentIcon} contentFit="contain" />
          ) : null}
          <ThemedText type="small" numberOfLines={1}>{card.agentName}</ThemedText>
        </View>
        <View style={styles.scoreRow}>
          <ThemedText type="smallBold">{card.teamScore}</ThemedText>
          <ThemedText type="xsmall" themeColor="textSecondary">{card.mapName}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">{card.kills}/{card.deaths}/{card.assists}</ThemedText>
          {typeof card.rankedRatingEarned === 'number' ? (
            <ThemedText type="xsmall" style={{ color: card.rankedRatingEarned >= 0 ? '#6ae2af' : '#e2616a' }}>
              {card.rankedRatingEarned >= 0 ? '+' : ''}{card.rankedRatingEarned} RR
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  carouselContent: {
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  card: {
    width: 200,
    borderRadius: Spacing.one,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.75,
  },
  mapSplash: {
    width: '100%',
    height: 80,
  },
  cardBody: {
    padding: Spacing.two,
    gap: Spacing.one,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  agentIcon: {
    width: 20,
    height: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
