import { router } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getAccountLabel } from '@/lib/account';
import { useAccountStore } from '@/stores/account-store';

type SwitchAccountSheetProps = {
  visible: boolean;
  onClose: () => void;
  onAddAccount: () => void;
};

export function SwitchAccountSheet({ visible, onClose, onAddAccount }: SwitchAccountSheetProps) {
  const theme = useTheme();
  const accounts = useAccountStore((state) => state.accounts);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const switchAccount = useAccountStore((state) => state.switchAccount);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.background }]}> 
          <ThemedView style={[styles.handle, { backgroundColor: theme.textSecondary }]} />
          <ThemedText type="subtitle">Switch Account</ThemedText>
          <ThemedView style={styles.accounts}>
            {accounts.map((account) => {
              const active = account.id === activeAccountId;
              return (
                <Pressable
                  key={account.id}
                  onPress={() => {
                    switchAccount(account.id);
                    onClose();
                    router.replace('/(tabs)/profile' as never);
                  }}
                  style={({ pressed }) => [
                    styles.accountRow,
                    {
                      backgroundColor: active ? theme.backgroundSelected : theme.backgroundElement,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <ThemedView style={[styles.accountAvatar, { backgroundColor: theme.primary }]}> 
                    <ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>
                      {account.gameName.slice(0, 2).toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.accountText}>
                    <ThemedText type="smallBold">{getAccountLabel(account)}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {account.shard.toUpperCase()}
                      {account.status === 'needsReauth' ? ' · Needs sign in' : ''}
                    </ThemedText>
                  </ThemedView>
                  {active && <ThemedText type="small" themeColor="primary">Active</ThemedText>}
                </Pressable>
              );
            })}
          </ThemedView>
          <PrimaryButton label="Add account" onPress={onAddAccount} />
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    opacity: 0.4,
  },
  accounts: {
    gap: Spacing.two,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  accountAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountText: {
    flex: 1,
    backgroundColor: 'transparent',
    gap: Spacing.half,
  },
});
