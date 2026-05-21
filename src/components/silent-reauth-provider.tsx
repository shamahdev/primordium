import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import type { StoredRiotAccount } from '@/lib/account';
import { AuthRecoveryRequired, registerSilentReauthRunner, type SilentReauthResult } from '@/lib/auth-coordinator';
import { getAuthCookies } from '@/lib/secure-auth-store';
import { clearRiotCookies, captureRiotAuthCookies, injectRiotAuthCookies } from '@/lib/riot-cookies';
import { getAccessTokenFromUri, RIOT_LOGIN_URL } from '@/lib/valorant-api';

type ReauthJob = {
  id: number;
  account: StoredRiotAccount;
  resolve: (result: SilentReauthResult) => void;
  reject: (error: unknown) => void;
};

const SILENT_REAUTH_TIMEOUT_MS = 30000;

export function SilentReauthProvider() {
  const [job, setJob] = React.useState<ReauthJob | null>(null);
  const [source, setSource] = React.useState<{ id: number; uri: string } | null>(null);
  const jobRef = React.useRef<ReauthJob | null>(null);
  const nextJobId = React.useRef(0);

  React.useEffect(() => {
    return registerSilentReauthRunner((account) =>
      new Promise<SilentReauthResult>(async (resolve, reject) => {
        const cookies = await getAuthCookies(account.id);
        if (!cookies?.length) {
          reject(
            new AuthRecoveryRequired(
              account.id,
              'missingCookies',
              'interactiveLoginRequired',
              'Saved Riot sign-in has expired.',
            ),
          );
          return;
        }
        setJob({ id: nextJobId.current++, account, resolve, reject });
      }),
    );
  }, []);

  React.useEffect(() => {
    jobRef.current = job;
  }, [job]);

  React.useEffect(() => {
    if (!job) {
      setSource(null);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      finishJob(
        job,
        undefined,
        new AuthRecoveryRequired(job.account.id, 'networkUnavailable', 'temporaryAuthUnavailable', 'Riot login timed out.'),
      );
    }, SILENT_REAUTH_TIMEOUT_MS);

    void (async () => {
      try {
        const cookies = await getAuthCookies(job.account.id);
        if (!cookies?.length) {
          throw new AuthRecoveryRequired(
            job.account.id,
            'missingCookies',
            'interactiveLoginRequired',
            'Saved Riot sign-in has expired.',
          );
        }
        await clearRiotCookies();
        await injectRiotAuthCookies(cookies);
        if (!cancelled) {
          setSource({ id: job.id, uri: RIOT_LOGIN_URL });
        }
      } catch (error) {
        finishJob(job, undefined, error);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [job]);

  const handleUrl = async (url?: string) => {
    const currentJob = jobRef.current;
    if (!currentJob || !url) {
      return;
    }

    if (url.includes('access_token=')) {
      try {
        const accessToken = getAccessTokenFromUri(url);
        const cookies = await captureRiotAuthCookies();
        finishJob(currentJob, { accessToken, cookies });
      } catch (error) {
        finishJob(currentJob, undefined, error);
      }
      return;
    }

    if (url.includes('authenticate.riotgames.com') && url.includes('/login')) {
      finishJob(
        currentJob,
        undefined,
        new AuthRecoveryRequired(
          currentJob.account.id,
          'cookieReauthFailed',
          'interactiveLoginRequired',
          'Riot requires sign-in again.',
        ),
      );
    }
  };

  if (!source) {
    return null;
  }

  return (
    <WebView
      key={source.id}
      cacheEnabled={false}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled={false}
      source={{ uri: source.uri }}
      onNavigationStateChange={(event) => void handleUrl(event.url)}
      onShouldStartLoadWithRequest={(request) => {
        void handleUrl(request.url);
        return true;
      }}
      onError={() => {
        const currentJob = jobRef.current;
        if (currentJob) {
          finishJob(
            currentJob,
            undefined,
            new AuthRecoveryRequired(
              currentJob.account.id,
              'networkUnavailable',
              'temporaryAuthUnavailable',
              'Could not reach Riot login.',
            ),
          );
        }
      }}
      style={styles.hiddenWebView}
    />
  );

  function finishJob(currentJob: ReauthJob, result?: SilentReauthResult, error?: unknown) {
    if (jobRef.current?.id !== currentJob.id) {
      return;
    }
    void clearRiotCookies();
    setSource(null);
    setJob(null);
    if (error) {
      currentJob.reject(error);
      return;
    }
    currentJob.resolve(result!);
  }
}

const styles = StyleSheet.create({
  hiddenWebView: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
