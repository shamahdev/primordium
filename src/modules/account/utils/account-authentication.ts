import { jwtDecode } from "jwt-decode";

import {
	buildRiotAuthorizedHeaders,
	fetchRiotEntitlementsToken,
	RiotHttpError,
	riotFetch,
} from "@/commons/lib/http";
import {
	type Account,
	type AccountShard,
	type AccountTokens,
	getAccountId,
} from "@/modules/account/account-type";

type NameServiceResponse = {
	DisplayName?: string;
	Subject: string;
	GameName: string;
	TagLine: string;
}[];

async function getPlayerName(
	accessToken: string,
	entitlementsToken: string,
	puuid: string,
	shard: AccountShard,
) {
	const response = await riotFetch<NameServiceResponse>(
		`https://pd.${shard}.a.pvp.net/name-service/v2/players`,
		{
			method: "PUT",
			headers: await buildRiotAuthorizedHeaders({
				accessToken,
				entitlementsToken,
			}),
			body: JSON.stringify([puuid]),
		},
	);

	const player = response[0];
	if (!player) {
		throw new RiotHttpError(
			"Riot account did not resolve in the selected Region. Check the Region and try again.",
		);
	}
	return player;
}

export type AuthenticateLoginResult = {
	account: Account;
	tokens: AccountTokens;
};

export async function authenticateLogin(
	accessToken: string,
	shard: AccountShard,
): Promise<AuthenticateLoginResult> {
	const decoded = jwtDecode<{
		sub: string;
		exp?: number;
	}>(accessToken);
	if (!decoded.sub) {
		throw new RiotHttpError("Riot token did not include a player id.");
	}

	const entitlementsToken = await fetchRiotEntitlementsToken(accessToken);
	const name = await getPlayerName(
		accessToken,
		entitlementsToken,
		decoded.sub,
		shard,
	);
	const now = new Date().toISOString();
	const account: Account = {
		id: getAccountId(decoded.sub, shard),
		puuid: decoded.sub,
		gameName: name.GameName || name.DisplayName || "?",
		tagLine: name.TagLine || "",
		displayName: name.DisplayName || `${name.GameName}#${name.TagLine}`,
		shard,
		status: "ready",
		createdAt: now,
		updatedAt: now,
	};

	const tokens: AccountTokens = {
		accessToken,
		entitlementsToken,
		savedAt: now,
		expiresAt: decoded.exp
			? new Date(decoded.exp * 1000).toISOString()
			: undefined,
	};

	return { account, tokens };
}
