import { isRiotHttpAuthFailure } from "@/commons/lib/http";
import { log } from "@/commons/lib/logger";
import {
	ACCOUNT_RIOT_LOGIN_URL,
	ACCOUNT_TOKEN_REFRESH_WINDOW_MS,
} from "@/modules/account/account-constants";
import { useAccountStore } from "@/modules/account/account-store";
import {
	type Account,
	AccountRecoveryError,
	type AccountSession,
	type AccountTokens,
	isAccountRecoveryError,
} from "@/modules/account/account-type";
import {
	deleteAuthMaterial,
	deleteCookies,
	getCookies,
	getTokens,
} from "@/modules/account/adapters/account-secure-storage.adapter";
import { waitForWebViewRefreshAdapter } from "@/modules/account/adapters/account-webview-refresh.adapter";
import {
	captureAccountCookies,
	clearAccountCookies,
	injectAccountCookies,
} from "@/modules/account/helpers/manage-account-cookies";
import { parseAccountRedirectToken } from "@/modules/account/helpers/parse-account-redirect-token";
import { authenticateLogin } from "@/modules/account/utils/account-authentication";

let globalQueue: Promise<unknown> = Promise.resolve();
const flights = new Map<string, Promise<AccountSession>>();

function shouldRefreshTokens(tokens: AccountTokens) {
	if (!tokens.expiresAt) {
		return false;
	}
	return (
		new Date(tokens.expiresAt).getTime() - Date.now() <=
		ACCOUNT_TOKEN_REFRESH_WINDOW_MS
	);
}

async function getValidTokens(account: Account): Promise<AccountTokens> {
	if (account.status === "needsReauth") {
		throw new AccountRecoveryError(
			account.id,
			"missingTokens",
			"interactiveLoginRequired",
			"Sign in again.",
		);
	}

	const tokens = await getTokens(account.id);
	if (!tokens) {
		return refreshTokens(account, false);
	}

	if (shouldRefreshTokens(tokens)) {
		return refreshTokens(account, false);
	}

	return tokens;
}

async function rejectAuth(
	accountId: string,
	reason: "cookieReauthFailed" | "identityMismatch",
) {
	await deleteAuthMaterial(accountId);
	useAccountStore.getState().markNeedsReauth(accountId);
	throw new AccountRecoveryError(
		accountId,
		reason,
		"interactiveLoginRequired",
		"Sign in again.",
	);
}

async function refreshTokens(
	account: Account,
	force: boolean,
): Promise<AccountTokens> {
	log.auth.info("refreshTokens: starting", { accountId: account.id, force });
	try {
		const result = await runSessionRefresh(account);
		log.auth.info("refreshTokens: session refreshed OK");
		const authenticated = await authenticateLogin(
			result.accessToken,
			account.shard,
		);
		if (authenticated.account.puuid !== account.puuid) {
			log.auth.error("refreshTokens: identity mismatch!", {
				expected: account.puuid,
				got: authenticated.account.puuid,
			});
			await rejectAuth(account.id, "identityMismatch");
		}
		await useAccountStore
			.getState()
			.saveAuthenticatedAccount(
				authenticated.account,
				authenticated.tokens,
				result.cookies,
			);
		log.auth.info("refreshTokens: account saved");
		return authenticated.tokens;
	} catch (error) {
		log.auth.error("refreshTokens: FAILED", {
			name: error instanceof Error ? error.name : typeof error,
			message: error instanceof Error ? error.message : String(error),
			isAuthRecovery: isAccountRecoveryError(error),
		});
		if (isAccountRecoveryError(error)) {
			if (error.recoveryKind === "interactiveLoginRequired") {
				if (
					error.reason === "cookieReauthFailed" ||
					error.reason === "missingCookies"
				) {
					await deleteCookies(account.id);
				}
				useAccountStore.getState().markNeedsReauth(account.id);
			}
			throw error;
		}
		if (isRiotHttpAuthFailure(error)) {
			await rejectAuth(account.id, "cookieReauthFailed");
		}
		if (!force && error instanceof TypeError) {
			throw new AccountRecoveryError(
				account.id,
				"networkUnavailable",
				"temporaryAuthUnavailable",
				"Network unavailable. Try again.",
			);
		}
		throw error;
	}
}

async function runSessionRefresh(account: Account) {
	const existing = flights.get(account.id);
	if (existing) {
		return existing;
	}

	const flight = runQueuedSessionRefresh(account).finally(() => {
		flights.delete(account.id);
	});
	flights.set(account.id, flight);
	return flight;
}

async function runQueuedSessionRefresh(account: Account) {
	const nextAdapter = await waitForWebViewRefreshAdapter();
	const queued = globalQueue.then(() =>
		runRefreshWithAdapter(account, nextAdapter),
	);
	globalQueue = queued.catch(() => undefined);
	return queued;
}

async function runRefreshWithAdapter(
	account: Account,
	nextAdapter: Awaited<ReturnType<typeof waitForWebViewRefreshAdapter>>,
) {
	const cookies = await getCookies(account.id);
	log.auth.debug("runSessionRefresh: cookies loaded", {
		accountId: account.id,
		cookieCount: cookies?.length ?? 0,
	});
	if (!cookies?.length) {
		log.auth.warn("runSessionRefresh: no cookies, throwing missingCookies");
		throw new AccountRecoveryError(
			account.id,
			"missingCookies",
			"interactiveLoginRequired",
			"Saved Riot sign-in has expired.",
		);
	}

	await clearAccountCookies();
	try {
		await injectAccountCookies(cookies);
		log.auth.debug("runSessionRefresh: cookies injected, calling adapter");
		const result = await nextAdapter({ sourceUri: ACCOUNT_RIOT_LOGIN_URL });
		log.auth.info("runSessionRefresh: adapter result", { kind: result.kind });
		if (result.kind === "loginRequired") {
			throw new AccountRecoveryError(
				account.id,
				"cookieReauthFailed",
				"interactiveLoginRequired",
				"Riot requires sign-in again.",
			);
		}
		if (result.kind === "networkUnavailable") {
			throw new AccountRecoveryError(
				account.id,
				"networkUnavailable",
				"temporaryAuthUnavailable",
				result.message,
			);
		}
		return {
			accessToken: parseAccountRedirectToken(result.uri),
			cookies: await captureAccountCookies(),
		};
	} finally {
		await clearAccountCookies();
	}
}

async function withAuthorizedTokens<T>(
	account: Account,
	request: (tokens: AccountTokens) => Promise<T>,
): Promise<T> {
	log.api.debug("withAuthorizedTokens: getting tokens", {
		accountId: account.id,
	});
	const tokens = await getValidTokens(account);
	try {
		return await request(tokens);
	} catch (error) {
		if (!isRiotHttpAuthFailure(error)) {
			throw error;
		}
		log.api.warn(
			"withAuthorizedTokens: first attempt auth failure, refreshing",
			{
				accountId: account.id,
			},
		);
	}

	const refreshedTokens = await refreshTokens(account, true);
	try {
		return await request(refreshedTokens);
	} catch (error) {
		if (isRiotHttpAuthFailure(error)) {
			log.api.error(
				"withAuthorizedTokens: second attempt auth failure, rejecting",
				{
					accountId: account.id,
				},
			);
			await rejectAuth(account.id, "cookieReauthFailed");
		}
		throw error;
	}
}

export const StoredRiotSession = {
	ensure(account: Account): Promise<AccountTokens> {
		return getValidTokens(account);
	},

	request<T>(
		account: Account,
		callback: (tokens: AccountTokens) => Promise<T>,
	): Promise<T> {
		return withAuthorizedTokens(account, callback);
	},

	refresh(account: Account): Promise<AccountTokens> {
		return refreshTokens(account, false);
	},

	async deleteAuthMaterial(accountId: string): Promise<void> {
		await deleteAuthMaterial(accountId);
	},
};
