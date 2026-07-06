import {
	ACCOUNT_FALLBACK_CLIENT_VERSION,
	ACCOUNT_RIOT_CLIENT_PLATFORM,
} from "@/modules/account/account-constants";
import type { AccountTokens } from "@/modules/account/account-type";

let clientVersion: string | null = null;

type EntitlementResponse = {
	entitlements_token: string;
};

export class RiotHttpError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
	}
}

export function isRiotHttpAuthFailure(error: unknown) {
	return (
		error instanceof RiotHttpError &&
		(error.status === 401 || error.status === 403)
	);
}

export async function getRiotClientVersion() {
	if (clientVersion) {
		return clientVersion;
	}

	try {
		const response = await fetch("https://valorant-api.com/v1/version");
		const data = (await response.json()) as {
			data: { riotClientVersion: string };
		};
		clientVersion = data.data.riotClientVersion;
		return clientVersion;
	} catch {
		return ACCOUNT_FALLBACK_CLIENT_VERSION;
	}
}

export async function buildRiotAuthorizedHeaders(
	tokens: Pick<AccountTokens, "accessToken" | "entitlementsToken">,
) {
	return {
		"Content-Type": "application/json",
		"X-Riot-ClientPlatform": ACCOUNT_RIOT_CLIENT_PLATFORM,
		"X-Riot-ClientVersion": await getRiotClientVersion(),
		"X-Riot-Entitlements-JWT": tokens.entitlementsToken,
		Authorization: `Bearer ${tokens.accessToken}`,
	};
}

export async function riotFetch<T>(url: string, init: RequestInit): Promise<T> {
	const response = await fetch(url, init);
	if (!response.ok) {
		throw new RiotHttpError(
			`Riot API request failed: ${response.status} ${response.statusText}`,
			response.status,
		);
	}
	return response.json() as Promise<T>;
}

export async function fetchRiotEntitlementsToken(accessToken: string) {
	const response = await riotFetch<EntitlementResponse>(
		"https://entitlements.auth.riotgames.com/api/token/v1",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({}),
		},
	);
	return response.entitlements_token;
}
