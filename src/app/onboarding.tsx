import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { VALORANT_SHARDS, type ValorantShard } from '@/lib/account';
import { buildOnboardingReturnTo, getLoginHref, getSwitchAccountHref } from '@/lib/navigation';
import { useAccountStore } from '@/stores/account-store';

export default function OnboardingScreen() {
  const params = useLocalSearchParams<{ shard?: string }>();
  const theme = useTheme();
  const accounts = useAccountStore((state) => state.accounts);
  const initialShard = VALORANT_SHARDS.some((shard) => shard.id === params.shard) ? (params.shard as ValorantShard) : 'eu';
  const [selectedShard, setSelectedShard] = React.useState<ValorantShard>(initialShard);

  const startLogin = () => {
    router.push(getLoginHref({ mode: 'add', shard: selectedShard, returnTo: '/profile' }));
  };

  const switchAccount = () => {
    router.push(getSwitchAccountHref({ reason: 'choose', returnTo: buildOnboardingReturnTo(selectedShard) }));
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.hero}>
            <ThemedText type="title" style={styles.title}>
              Primordium
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary">
              Pick Region:
            </ThemedText>
            <ThemedView style={styles.regionGrid}>
              {VALORANT_SHARDS.map((shard) => {
                const selected = shard.id === selectedShard;
                return (
                  <Pressable
                    key={shard.id}
                    onPress={() => setSelectedShard(shard.id)}
                    style={({ pressed }) => [
                      styles.regionButton,
                      {
                        borderColor: selected ? theme.primary : theme.backgroundSelected,
                        backgroundColor: selected ? theme.primary : theme.backgroundElement,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: selected ? theme.primaryForeground : theme.text }}>
                      {shard.label}
                    </ThemedText>
                    <ThemedText
                      type="code"
                      style={{ color: selected ? theme.primaryForeground : theme.textSecondary }}>
                      {shard.id.toUpperCase()}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
          </ThemedView>

          {Platform.OS === 'web' ? (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Native app required</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                WebView authentication is only supported for iOS and Android.
              </ThemedText>
            </ThemedView>
          ) : (
            <PrimaryButton label="Login" onPress={startLogin} />
          )}

          {accounts.length > 0 && (
            <Pressable onPress={switchAccount} style={({ pressed }) => [styles.switchAccount, pressed && styles.pressed]}>
              <ThemedText type="small" themeColor="textSecondary">
                Switch Account
              </ThemedText>
            </Pressable>
          )}

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Security note</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              We do not collect or store your account credentials. When you log in via the official Riot Games portal, our app securely receives an authorization token. This token is used solely to authenticate official API requests directly from Riot.
            </ThemedText>
          </ThemedView>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  hero: {
    gap: Spacing.two,
  },
  eyebrow: {
    letterSpacing: 2,
  },
  title: {
    maxWidth: 620,
  },
  subtitle: {
    maxWidth: 520,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  section: {
    gap: Spacing.three,
  },
  regionGrid: {
    flexDirection: 'column',
    gap: Spacing.two,
  },
  regionButton: {
    minWidth: 130,
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  switchAccount: {
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
