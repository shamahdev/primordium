import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';

import { fetchLatestVersion, isNewerVersion } from '@/lib/version-check';

const DISMISSED_VERSION_KEY = 'update_dismissed_version';

interface UpdateCheckResult {
  showBanner: boolean;
  latestVersion: string | null;
  releaseUrl: string | null;
  dismissBanner: () => void;
}

export function useUpdateCheck(): UpdateCheckResult {
  const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
  const [showBanner, setShowBanner] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [releaseUrl, setReleaseUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const dismissed = await AsyncStorage.getItem(DISMISSED_VERSION_KEY);
        const latest = await fetchLatestVersion();

        if (cancelled || !latest) return;

        if (isNewerVersion(currentVersion, latest.version)) {
          setLatestVersion(latest.version);
          setReleaseUrl(latest.html_url);
          setShowBanner(dismissed !== latest.version);
        }
      } catch {
        // silent
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentVersion]);

  const dismissBanner = useCallback(() => {
    if (latestVersion) {
      void AsyncStorage.setItem(DISMISSED_VERSION_KEY, latestVersion);
    }
    setShowBanner(false);
  }, [latestVersion]);

  return { showBanner, latestVersion, releaseUrl, dismissBanner };
}
