import type { Href } from "expo-router";

import {
	type AccountShard,
	isAccountShard,
} from "@/modules/account/account-type";

export type AccountLoginMode = "add" | "reauth";

export type AccountSwitchReason = "choose" | "reauthFailed" | "afterRemoval";

export type AccountReturnToRoute =
	| "/home"
	| "/profile"
	| `/onboarding?shard=${AccountShard}`;

const ONBOARDING_RETURN_TO_PREFIX = "/onboarding?shard=";

export function buildOnboardingReturnTo(
	shard: AccountShard,
): AccountReturnToRoute {
	return `/onboarding?shard=${shard}`;
}

export function sanitizeReturnToRoute(returnTo?: string): AccountReturnToRoute {
	if (returnTo === "/home") {
		return "/home";
	}

	if (returnTo === "/profile") {
		return "/profile";
	}

	if (returnTo?.startsWith(ONBOARDING_RETURN_TO_PREFIX)) {
		const shard = returnTo.slice(ONBOARDING_RETURN_TO_PREFIX.length);
		if (isAccountShard(shard)) {
			return buildOnboardingReturnTo(shard as AccountShard);
		}
	}

	return "/home";
}

export function getReturnToHref(returnTo?: string): Href {
	const route = sanitizeReturnToRoute(returnTo);
	if (route === "/home") {
		return "/home";
	}

	if (route === "/profile") {
		return "/profile";
	}

	const shard = route.slice(ONBOARDING_RETURN_TO_PREFIX.length) as AccountShard;
	return { pathname: "/onboarding", params: { shard } };
}

export function getLoginHref(params: {
	mode: AccountLoginMode;
	shard?: AccountShard;
	accountId?: string;
	returnTo?: AccountReturnToRoute;
}): Href {
	return { pathname: "/login", params };
}

export function getSwitchAccountHref(params: {
	reason: AccountSwitchReason;
	returnTo?: AccountReturnToRoute;
	accountId?: string;
}): Href {
	return { pathname: "/switch-account", params };
}

export function getOnboardingHref(shard?: AccountShard): Href {
	if (!shard) {
		return "/onboarding";
	}

	return { pathname: "/onboarding", params: { shard } };
}
