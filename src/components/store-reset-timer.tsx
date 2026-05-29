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
    <ThemedText type="xsmall" themeColor="textSecondary">
      {prefix} {formatRemaining(expiresAt, now)}
    </ThemedText>
  );
}

function formatRemaining(expiresAt: string, now: number) {
  const diff = Math.max(new Date(expiresAt).getTime() - now, 0);
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
