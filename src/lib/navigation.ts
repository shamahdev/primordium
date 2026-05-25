import type { Href } from 'expo-router';

import { isValorantShard, type ValorantShard } from '@/lib/account';

export type LoginMode = 'add' | 'reauth';

export type SwitchReason = 'choose' | 'reauthFailed' | 'afterRemoval';

export type ReturnToRoute = '/profile' | `/onboarding?shard=${ValorantShard}`;

const ONBOARDING_RETURN_TO_PREFIX = '/onboarding?shard=';

export function buildOnboardingReturnTo(shard: ValorantShard): ReturnToRoute {
  return `/onboarding?shard=${shard}`;
}

export function sanitizeReturnToRoute(returnTo?: string): ReturnToRoute {
  if (returnTo === '/profile') {
    return '/profile';
  }

  if (returnTo?.startsWith(ONBOARDING_RETURN_TO_PREFIX)) {
    const shard = returnTo.slice(ONBOARDING_RETURN_TO_PREFIX.length);
    if (isValorantShard(shard)) {
      return buildOnboardingReturnTo(shard);
    }
  }

  return '/profile';
}

export function getReturnToHref(returnTo?: string): Href {
  const route = sanitizeReturnToRoute(returnTo);
  if (route === '/profile') {
    return '/profile';
  }

  const shard = route.slice(ONBOARDING_RETURN_TO_PREFIX.length) as ValorantShard;
  return { pathname: '/onboarding', params: { shard } };
}

export function getLoginHref(params: {
  mode: LoginMode;
  shard?: ValorantShard;
  accountId?: string;
  returnTo?: ReturnToRoute;
}): Href {
  return { pathname: '/login', params };
}

export function getSwitchAccountHref(params: {
  reason: SwitchReason;
  returnTo?: ReturnToRoute;
  accountId?: string;
}): Href {
  return { pathname: '/switch-account', params };
}

export function getOnboardingHref(shard?: ValorantShard): Href {
  if (!shard) {
    return '/onboarding';
  }

  return { pathname: '/onboarding', params: { shard } };
}
