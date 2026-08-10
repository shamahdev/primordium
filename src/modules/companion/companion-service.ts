import { buildRiotAuthorizedHeaders, riotFetch } from "@/commons/lib/http";
import type { Account, AccountTokens } from "@/modules/account/account-type";
import { StoredRiotSession } from "@/modules/account/utils/stored-riot-session";
import { CatalogService } from "@/modules/catalog/catalog-service";
import type { CompetitiveTier } from "@/modules/catalog/catalog-type";
import type {
	CompanionRank,
	CompetitiveRank,
	CompetitiveUpdate,
	MatchCard,
	MatchQueueType,
} from "./companion-type";

type MmrSeasonalInfo = {
	SeasonID?: string;
	Rank: number;
	CompetitiveTier?: number;
	RankedRating: number;
	NumberOfWins: number;
	NumberOfGames: number;
};

type MmrQueueSkills = {
	competitive?: {
		SeasonalInfoBySeasonID?: Record<string, MmrSeasonalInfo>;
	};
};

type MmrLatestCompetitiveUpdate = {
	MatchID: string | null;
	RankedRatingEarned: number;
	TierBeforeUpdate: number;
	TierAfterUpdate: number;
	MapID?: string;
	SeasonID?: string;
	MatchStartTime?: number;
	RankedRatingAfterUpdate?: number;
	RankedRatingBeforeUpdate?: number;
} | null;

type MmrResponse = {
	QueueSkills: MmrQueueSkills | null;
	LatestCompetitiveUpdate?: MmrLatestCompetitiveUpdate;
};

type MatchHistoryEntry = {
	MatchID: string;
	GameStartTime: number;
	QueueID?: string;
};

type MatchHistoryResponse = {
	History?: MatchHistoryEntry[];
	Subject?: string;
	BeginIndex?: number;
	EndIndex?: number;
	Total?: number;
};

type MatchPlayerStats = {
	kills?: number;
	deaths?: number;
	assists?: number;
	score?: number;
	roundsPlayed?: number;
};

type RawMatchDetailsResponse = Record<string, unknown>;

const MATCH_HISTORY_COUNT = 5;
const MATCH_QUEUE_MAP: Record<string, MatchQueueType> = {
	competitive: "competitive",
	unrated: "unrated",
	spikerush: "spikerush",
	deathmatch: "deathmatch",
	swiftplay: "swiftplay",
	escalation: "escalation",
	replication: "replication",
	custom: "custom",
	tournament: "tournament",
	onefa: "onefa",
	newmode: "newmode",
	ggteam: "ggteam",
};

export const CompanionService = {
	async fetchRank(account: Account): Promise<CompanionRank> {
		return StoredRiotSession.request(account, (tokens) =>
			fetchRankWithTokens(account, tokens),
		);
	},

	async fetchRecentMatches(account: Account): Promise<MatchCard[]> {
		return StoredRiotSession.request(account, (tokens) =>
			fetchRecentMatchesWithTokens(account, tokens),
		);
	},
};

async function fetchRankWithTokens(
	account: Account,
	tokens: AccountTokens,
): Promise<CompanionRank> {
	const headers = await buildRiotAuthorizedHeaders(tokens);
	const mmr = await riotFetch<MmrResponse>(
		`https://pd.${account.shard}.a.pvp.net/mmr/v1/players/${account.puuid}`,
		{ headers },
	);

	const seasonalMap =
		mmr.QueueSkills?.competitive?.SeasonalInfoBySeasonID ?? null;
	const seasonalInfo = pickCurrentSeasonInfo(
		seasonalMap,
		mmr.LatestCompetitiveUpdate ?? null,
	);
	const tierNumber = seasonalInfo?.CompetitiveTier ?? seasonalInfo?.Rank ?? 0;
	const tier = await CatalogService.getCompetitiveTier(tierNumber);

	const rank: CompetitiveRank | null =
		seasonalInfo && tier
			? {
					tierNumber,
					tierName: tier.tierName,
					tierShortName: toTierShortName(tier),
					color: tier.color,
					rankedRating: seasonalInfo.RankedRating,
					wins: seasonalInfo.NumberOfWins,
					games: seasonalInfo.NumberOfGames,
				}
			: null;

	const update = mmr.LatestCompetitiveUpdate;
	const latestUpdate: CompetitiveUpdate | null =
		update && typeof update.MatchID === "string"
			? {
					matchId: update.MatchID,
					rankedRatingEarned: update.RankedRatingEarned,
					tierBefore: update.TierBeforeUpdate,
					tierAfter: update.TierAfterUpdate,
				}
			: null;

	return { rank, latestUpdate, fetchedAt: new Date().toISOString() };
}

function pickCurrentSeasonInfo(
	seasonalMap: Record<string, MmrSeasonalInfo> | null,
	latestUpdate: MmrLatestCompetitiveUpdate,
): MmrSeasonalInfo | undefined {
	if (!seasonalMap) return undefined;
	const entries = Object.entries(seasonalMap);
	if (entries.length === 0) return undefined;
	if (entries.length === 1) return entries[0][1];

	// Prefer the season that matches LatestCompetitiveUpdate.SeasonID (current season hint)
	const seasonIdHint = latestUpdate?.SeasonID;
	if (seasonIdHint && seasonalMap[seasonIdHint]) {
		return seasonalMap[seasonIdHint];
	}
	// Fallback: pick entry with most games – likely current season
	let best = entries[0][1];
	let bestGames = best.NumberOfGames ?? 0;
	for (const [, info] of entries.slice(1)) {
		const games = info.NumberOfGames ?? 0;
		if (games > bestGames) {
			best = info;
			bestGames = games;
		}
	}
	// If all zeros, fallback to last inserted (object insertion order = chronological)
	if (bestGames === 0) return entries[entries.length - 1][1];
	return best;
}

async function fetchRecentMatchesWithTokens(
	account: Account,
	tokens: AccountTokens,
): Promise<MatchCard[]> {
	const headers = await buildRiotAuthorizedHeaders(tokens);
	const history = await riotFetch<MatchHistoryResponse>(
		`https://pd.${account.shard}.a.pvp.net/match-history/v1/history/${account.puuid}?startIndex=0&endIndex=${MATCH_HISTORY_COUNT - 1}`,
		{ headers },
	);

	const entries = history.History ?? [];
	if (entries.length === 0) {
		return [];
	}

	// Reuse same tokens to avoid nested StoredRiotSession re-entry; fetch MMR directly
	let latestCompetitiveMatchId: string | null = null;
	let latestRrEarned: number | undefined;
	try {
		const rank = await fetchRankWithTokens(account, tokens);
		latestCompetitiveMatchId = rank.latestUpdate?.matchId ?? null;
		latestRrEarned = rank.latestUpdate?.rankedRatingEarned;
	} catch {
		// ignore rank fetch failure – still show matches without RR delta
	}

	const [maps, agents] = await Promise.all([
		CatalogService.getMaps(),
		CatalogService.getAgents(),
	]);

	const cards = await Promise.all(
		entries.map((entry) =>
			fetchMatchCard(
				account,
				tokens,
				entry,
				maps,
				agents,
				latestCompetitiveMatchId,
				latestRrEarned,
			),
		),
	);

	return cards.filter((card): card is MatchCard => card !== null);
}

async function fetchMatchCard(
	account: Account,
	tokens: AccountTokens,
	entry: MatchHistoryEntry,
	maps: Awaited<ReturnType<typeof CatalogService.getMaps>>,
	agents: Awaited<ReturnType<typeof CatalogService.getAgents>>,
	latestCompetitiveMatchId: string | null,
	latestRrEarned?: number,
): Promise<MatchCard | null> {
	try {
		const headers = await buildRiotAuthorizedHeaders(tokens);
		const details = await riotFetch<RawMatchDetailsResponse>(
			`https://pd.${account.shard}.a.pvp.net/match-details/v1/matches/${entry.MatchID}`,
			{ headers },
		);

		const { matchInfo, players, teams } = normalizeMatchDetails(details);
		if (!matchInfo) {
			return null;
		}

		const player = players.find((candidate) => candidate.puuid === account.puuid);
		if (!player) {
			return null;
		}

		const map = maps.get(matchInfo.mapId);
		const agent = agents.get(player.characterId);
		const queueType = matchInfo.queueId
			? (MATCH_QUEUE_MAP[matchInfo.queueId.toLowerCase()] ??
				MATCH_QUEUE_MAP[matchInfo.queueId] ??
				"unknown")
			: "unknown";
		const kills = player.stats?.kills ?? 0;
		const deaths = player.stats?.deaths ?? 0;
		const assists = player.stats?.assists ?? 0;

		const playerTeam = teams.find((team) => team.teamId === player.teamId);
		const opponentTeam = teams.find((team) => team.teamId !== player.teamId);
		// Prefer explicit won flag (real API), fallback to rounds comparison
		const won: boolean | null =
			playerTeam?.won !== undefined && opponentTeam?.won !== undefined
				? playerTeam.won
				: playerTeam && opponentTeam
					? playerTeam.roundsWon > opponentTeam.roundsWon
					: null;
		const teamRounds = playerTeam?.roundsWon ?? 0;
		const opponentRounds = opponentTeam?.roundsWon ?? 0;

		const rankedRatingEarned =
			entry.MatchID === latestCompetitiveMatchId ? latestRrEarned : undefined;

		return {
			matchId: entry.MatchID,
			gameStartTime: new Date(entry.GameStartTime).toISOString(),
			queueType,
			mapName: map?.displayName ?? "Unknown Map",
			mapIcon: map?.listViewIcon ?? undefined,
			mapSplash: map?.splash ?? undefined,
			agentName: agent?.displayName ?? "Unknown Agent",
			agentIcon: agent?.displayIcon ?? undefined,
			kills,
			deaths,
			assists,
			won,
			teamScore: `${teamRounds}:${opponentRounds}`,
			rankedRatingEarned,
		};
	} catch {
		return null;
	}
}

function normalizeMatchDetails(raw: RawMatchDetailsResponse): {
	matchInfo: { mapId: string; queueId?: string; gameStartMillis?: number } | null;
	players: {
		puuid: string;
		teamId: string;
		characterId: string;
		stats: MatchPlayerStats | null;
	}[];
	teams: { teamId: string; won?: boolean; roundsWon: number; roundsPlayed?: number }[];
} {
	// API is camelCase: matchInfo, players, teams – but handle PascalCase fallback for resilience
	const matchInfoRaw =
		(raw.matchInfo as Record<string, unknown> | undefined) ??
		(raw.MatchInfo as Record<string, unknown> | undefined) ??
		null;
	const playersRaw =
		(raw.players as unknown[] | undefined) ??
		(raw.Players as unknown[] | undefined) ??
		[];
	const teamsRaw =
		(raw.teams as unknown[] | undefined) ??
		(raw.Teams as unknown[] | undefined) ??
		[];

	const matchInfo = matchInfoRaw
		? {
				mapId: String(
					(matchInfoRaw.mapId ?? matchInfoRaw.MapID ?? "") as string,
				),
				queueId: (matchInfoRaw.queueID ?? matchInfoRaw.QueueID) as
					| string
					| undefined,
				gameStartMillis: (matchInfoRaw.gameStartMillis ??
					matchInfoRaw.GameStartMillis) as number | undefined,
			}
		: null;

	const players = (playersRaw as Record<string, unknown>[]).map((p) => ({
		puuid: String((p.subject ?? p.PUUID ?? p.puuid ?? "") as string),
		teamId: String((p.teamId ?? p.TeamID ?? "") as string),
		characterId: String((p.characterId ?? p.CharacterID ?? "") as string),
		stats: (p.stats ?? p.Stats ?? null) as MatchPlayerStats | null,
	}));

	const teams = (teamsRaw as Record<string, unknown>[]).map((t) => ({
		teamId: String((t.teamId ?? t.TeamID ?? "") as string),
		won: (t.won ?? t.Won) as boolean | undefined,
		roundsWon: Number((t.roundsWon ?? t.RoundsWon ?? 0) as number),
		roundsPlayed: (t.roundsPlayed ?? t.RoundsPlayed) as number | undefined,
	}));

	return { matchInfo, players, teams };
}

function toTierShortName(tier: CompetitiveTier): string {
	if (tier.tier === 0) return "Unrated";
	if (tier.tier === 27) return "Radiant";
	const division = tier.division
		.replace("ECompetitiveDivision::", "")
		.toLowerCase();
	const tierNum = tier.tierName.match(/\d+$/)?.[0] ?? "";
	const divisionShort = division.charAt(0).toUpperCase() + division.slice(1, 3);
	return tierNum ? `${divisionShort} ${tierNum}` : divisionShort;
}
