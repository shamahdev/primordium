import type { CompanionRank } from "@/modules/companion/companion-type";
import type { StoreSnapshot } from "@/modules/store/store-type";

export const ACCOUNT_SHARDS = [
	{ id: "eu", label: "Europe" },
	{ id: "na", label: "North America" },
	{ id: "ap", label: "Asia Pacific" },
	{ id: "kr", label: "Korea" },
] as const;

export type AccountShard = (typeof ACCOUNT_SHARDS)[number]["id"];

export type AccountStatus = "ready" | "needsReauth";

export type AccountProfile = {
	level: number;
	xp: number;
	balances: {
		vp: number;
		radianite: number;
		kingdomCredits: number;
	};
	fetchedAt: string;
};

export type Account = {
	id: string;
	puuid: string;
	gameName: string;
	tagLine: string;
	displayName: string;
	shard: AccountShard;
	status: AccountStatus;
	createdAt: string;
	updatedAt: string;
	profileSnapshot?: AccountProfile;
	rankSnapshot?: CompanionRank;
	storeSnapshot?: StoreSnapshot;
};

export type AccountTokens = {
	accessToken: string;
	entitlementsToken: string;
	savedAt: string;
	expiresAt?: string;
};

export type AccountCookie = {
	name: string;
	value: string;
	domain: string;
	path?: string;
	expires?: string;
	secure?: boolean;
	httpOnly?: boolean;
};

export type AccountRecoveryReason =
	| "missingTokens"
	| "missingCookies"
	| "cookieReauthFailed"
	| "identityMismatch"
	| "providerUnavailable"
	| "networkUnavailable";

export type AccountRecoveryKind =
	| "interactiveLoginRequired"
	| "temporaryAuthUnavailable";

export class AccountRecoveryError extends Error {
	constructor(
		readonly accountId: string,
		readonly reason: AccountRecoveryReason,
		readonly recoveryKind: AccountRecoveryKind,
		message = "Authentication recovery is required.",
	) {
		super(message);
		this.name = "AccountRecoveryError";
	}
}

export function isAccountRecoveryError(
	error: unknown,
): error is AccountRecoveryError {
	return error instanceof AccountRecoveryError;
}

export type AccountSession = {
	accessToken: string;
	cookies: AccountCookie[];
};

export type AccountSessionRefreshResult =
	| { kind: "redirect"; uri: string }
	| { kind: "loginRequired" }
	| { kind: "networkUnavailable"; message: string };

export type AccountRecoveryAction =
	| { kind: "temporaryError"; message: string }
	| { kind: "reauth"; href: any }
	| { kind: "unknownError"; message: string };

export type AccountLoginMode = "add" | "reauth";

export type AccountSwitchReason = "choose" | "reauthFailed" | "afterRemoval";

export type AccountReturnToRoute =
	| "/home"
	| "/profile"
	| `/onboarding?shard=${AccountShard}`;

export function isAccountShard(value: unknown): value is AccountShard {
	return (
		typeof value === "string" &&
		ACCOUNT_SHARDS.some((shard) => shard.id === value)
	);
}

export function getAccountId(puuid: string, shard: AccountShard) {
	return `${puuid}.${shard}`;
}

export function getAccountLabel(
	account: Pick<Account, "displayName" | "gameName" | "tagLine" | "puuid">,
) {
	if (account.gameName && account.tagLine) {
		return `${account.gameName}#${account.tagLine}`;
	}
	if (account.displayName) {
		return account.displayName;
	}
	return account.puuid.slice(0, 8);
}
