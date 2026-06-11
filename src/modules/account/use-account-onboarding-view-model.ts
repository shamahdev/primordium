import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ACCOUNT_SHARDS, type AccountShard } from '@/modules/account/account-type';
import { useAccountStore } from '@/modules/account/account-store';
import { buildOnboardingReturnTo, getLoginHref, getSwitchAccountHref } from '@/modules/account/helpers/get-account-navigation-href';

export function useAccountOnboardingViewModel() {
  const params = useLocalSearchParams<{ shard?: string }>();
  const accounts = useAccountStore((state) => state.accounts);
  const initialShard = ACCOUNT_SHARDS.some((shard) => shard.id === params.shard)
    ? (params.shard as AccountShard)
    : 'eu';
  const [selectedShard, setSelectedShard] = React.useState<AccountShard>(initialShard);

  const startLogin = () => {
    router.push(getLoginHref({ mode: 'add', shard: selectedShard, returnTo: '/home' }));
  };

  const switchAccount = () => {
    router.push(getSwitchAccountHref({ reason: 'choose', returnTo: buildOnboardingReturnTo(selectedShard) }));
  };

  return {
    accounts,
    selectedShard,
    setSelectedShard,
    startLogin,
    switchAccount,
  };
}
