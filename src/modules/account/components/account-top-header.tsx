import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/commons/components/themed-text';
import { ThemedView } from '@/commons/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/commons/constants/theme';
import { getAccountLabel } from '@/modules/account/account-type';
import { useAccountStore } from '@/modules/account/account-store';

export function AccountTopHeader() {
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );

  if (!account) {
    return null;
  }

  const balances = account.profileSnapshot?.balances;
  const rank = account.rankSnapshot?.rank;

  return (
    <ThemedView style={styles.outer}>
      <View style={styles.inner}>
        <Pressable
          onPress={() => router.push('/switch-account')}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <View style={styles.identity}>
            <ThemedText type="smallBold" numberOfLines={1} style={{ color: Colors.dark.text }}>
              {getAccountLabel(account)}
            </ThemedText>
            {rank ? <RankPill rank={rank} update={account.rankSnapshot?.latestUpdate ?? null} /> : null}
          </View>
        </Pressable>
        <View style={styles.balances}>
          <BalancePill icon={require('@/assets/images/valorant/vp.png')} value={balances?.vp} />
          <BalancePill icon={require('@/assets/images/valorant/radianite.png')} value={balances?.radianite} />
          <BalancePill icon={require('@/assets/images/valorant/kc.png')} value={balances?.kingdomCredits} />
        </View>
      </View>
    </ThemedView>
  );
}

function RankPill({ rank, update }: {
  rank: { tierShortName: string; color: string; rankedRating: number };
  update: { rankedRatingEarned: number } | null;
}) {
  const delta = update?.rankedRatingEarned;
  const hasDelta = typeof delta === 'number';
  const deltaArrow = hasDelta && delta !== undefined ? (delta >= 0 ? '↑' : '↓') : null;
  return (
    <View style={styles.rankPill}>
      <View style={[styles.rankDot, { backgroundColor: `#${rank.color.slice(0, 6)}` }]} />
      <ThemedText type="xsmall" style={{ color: Colors.dark.text }}>
        {rank.tierShortName} · {rank.rankedRating} RR
      </ThemedText>
      {deltaArrow ? (
        <ThemedText type="xsmall" style={{ color: hasDelta && delta >= 0 ? '#6ae2af' : '#e2616a' }}>
          {deltaArrow}{hasDelta && delta !== undefined ? Math.abs(delta) : ''}
        </ThemedText>
      ) : null}
    </View>
  );
}

function BalancePill({ icon, value }: { icon: number; value?: number }) {
  return (
    <View style={styles.balancePill}>
      <Image source={icon} style={styles.currencyIcon} />
      <ThemedText type="smallBold" numberOfLines={1} style={{ color: Colors.dark.text }}>
        {typeof value === 'number' ? value.toLocaleString() : '--'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    color: Colors.dark.text,
    backgroundColor: Colors.dark.background,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  identity: {
    flex: 1,
    gap: Spacing.half,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  rankDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balances: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  currencyIcon: {
    width: 16,
    height: 16,
  },
});
