import { buildRiotAuthorizedHeaders, riotFetch } from "@/commons/lib/http";
import type { Account, AccountTokens } from "@/modules/account/account-type";
import { StoredRiotSession } from "@/modules/account/utils/stored-riot-session";

const OWNED_ITEM_TYPE_IDS = {
	skin: "e7c63390-eda7-46e0-bb7a-a6abdacd2433",
	skinChroma: "3ad1b2b2-acdb-4524-852f-954a76ddae0a",
	buddy: "dd3bf334-87f3-40bd-b043-682a57a8dc3a",
	spray: "d5f120f8-ff8c-4aac-92ea-f2b5acbe9475",
	playerCard: "3f296c07-64c3-494c-923b-fe692a4fa1bd",
	playerTitle: "de7caa6b-adf7-4588-bbd1-143831e786c6",
} as const;

type OwnedResponse = {
	EntitlementsByTypes?: {
		ItemTypeID: string;
		Entitlements: { ItemID: string; TypeID: string }[];
	}[];
};

export const OwnedItemsService = {
	async fetchOwnedItemIds(account: Account): Promise<Set<string>> {
		return StoredRiotSession.request(account, (tokens) =>
			fetchOwnedItemIdsWithTokens(account, tokens),
		);
	},
};

async function fetchOwnedItemIdsWithTokens(
	account: Account,
	tokens: AccountTokens,
): Promise<Set<string>> {
	const headers = await buildRiotAuthorizedHeaders(tokens);
	const responses = await Promise.all(
		Object.values(OWNED_ITEM_TYPE_IDS).map((typeId) =>
			riotFetch<OwnedResponse>(
				`https://pd.${account.shard}.a.pvp.net/store/v1/entitlements/${account.puuid}/${typeId}`,
				{ headers },
			).catch(() => ({ EntitlementsByTypes: [] }) as OwnedResponse),
		),
	);

	const owned = new Set<string>();
	for (const response of responses) {
		for (const group of response.EntitlementsByTypes ?? []) {
			for (const entitlement of group.Entitlements) {
				owned.add(entitlement.ItemID);
			}
		}
	}
	return owned;
}
