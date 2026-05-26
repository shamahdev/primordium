import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getAccountLabel } from '@/lib/account';
import { useAccountStore } from '@/stores/account-store';

export function TabHeader() {
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );

  if (!account) {
    return null;
  }

  const balances = account.profileSnapshot?.balances;

  return (
    <ThemedView style={styles.outer}>
      <View style={styles.inner}>
        <View style={styles.identity}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {getAccountLabel(account)}
          </ThemedText>
        </View>
        <View style={styles.balances}>
          <BalancePill icon={require('@/assets/images/valorant/vp.png')} value={balances?.vp} />
          <BalancePill icon={require('@/assets/images/valorant/radianite.png')} value={balances?.radianite} />
          <BalancePill icon={require('@/assets/images/valorant/kc.png')} value={balances?.kingdomCredits} />
        </View>
      </View>
    </ThemedView>
  );
}

function BalancePill({ icon, value }: { icon: number; value?: number }) {
  return (
    <View style={styles.balancePill}>
      <Image source={icon} style={styles.currencyIcon} />
      <ThemedText type="smallBold" numberOfLines={1}>
        {typeof value === 'number' ? value.toLocaleString() : '--'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
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
