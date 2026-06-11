import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { ACCOUNT_RIOT_INTERACTIVE_LOGIN_HOST, ACCOUNT_RIOT_INTERACTIVE_LOGIN_PATH } from '@/modules/account/account-constants';
import { registerWebViewRefreshAdapter } from '@/modules/account/adapters/account-webview-refresh.adapter';
import type { AccountSessionRefreshResult } from '@/modules/account/account-type';

type SessionRefreshJob = {
  id: number;
  sourceUri: string;
  resolve: (result: AccountSessionRefreshResult) => void;
};

const SESSION_REFRESH_TIMEOUT_MS = 30000;

export function AccountSessionRefreshWebView() {
  const [job, setJob] = React.useState<SessionRefreshJob | null>(null);
  const jobRef = React.useRef<SessionRefreshJob | null>(null);
  const nextJobId = React.useRef(0);

  const finishJob = (currentJob: SessionRefreshJob, result: AccountSessionRefreshResult) => {
    if (jobRef.current?.id !== currentJob.id) {
      return;
    }
    setJob(null);
    currentJob.resolve(result);
  };

  React.useEffect(() => {
    return registerWebViewRefreshAdapter(({ sourceUri }) =>
      new Promise<AccountSessionRefreshResult>((resolve) => {
        setJob({ id: nextJobId.current++, sourceUri, resolve });
      }),
    );
  }, []);

  React.useEffect(() => {
    jobRef.current = job;
  }, [job]);

  React.useEffect(() => {
    if (!job) {
      return;
    }

    const timeout = setTimeout(() => {
      finishJob(job, { kind: 'networkUnavailable', message: 'Riot login timed out.' });
    }, SESSION_REFRESH_TIMEOUT_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [job]);

  const handleUrl = (url?: string) => {
    const currentJob = jobRef.current;
    if (!currentJob || !url) {
      return;
    }

    if (url.includes('access_token=')) {
      finishJob(currentJob, { kind: 'redirect', uri: url });
      return;
    }

    if (url.includes(ACCOUNT_RIOT_INTERACTIVE_LOGIN_HOST) && url.includes(ACCOUNT_RIOT_INTERACTIVE_LOGIN_PATH)) {
      finishJob(currentJob, { kind: 'loginRequired' });
    }
  };

  if (!job) {
    return null;
  }

  return (
    <WebView
      key={job.id}
      cacheEnabled={false}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled={false}
      source={{ uri: job.sourceUri }}
      onNavigationStateChange={(event) => handleUrl(event.url)}
      onShouldStartLoadWithRequest={(request) => {
        handleUrl(request.url);
        return true;
      }}
      onError={() => {
        const currentJob = jobRef.current;
        if (currentJob) {
          finishJob(currentJob, { kind: 'networkUnavailable', message: 'Could not reach Riot login.' });
        }
      }}
      style={styles.hiddenWebView}
    />
  );
}

const styles = StyleSheet.create({
  hiddenWebView: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
