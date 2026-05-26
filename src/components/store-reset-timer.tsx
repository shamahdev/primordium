import React from 'react';

import { ThemedText } from '@/components/themed-text';

type StoreResetTimerProps = {
  expiresAt: string;
  prefix?: string;
};

export function StoreResetTimer({ expiresAt, prefix = 'Reset in' }: StoreResetTimerProps) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemedText type="small" themeColor="textSecondary">
      {prefix} {formatRemaining(expiresAt, now)}
    </ThemedText>
  );
}

function formatRemaining(expiresAt: string, now: number) {
  const diff = Math.max(new Date(expiresAt).getTime() - now, 0);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}
