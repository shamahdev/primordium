import { buildRiotAuthorizedHeaders, riotFetch } from '@/commons/lib/http';
import { CatalogService } from '@/modules/catalog/catalog-service';
import type { Account, AccountTokens } from '@/modules/account/account-type';
import { StoredRiotSession } from '@/modules/account/utils/stored-riot-session';
import type { CompetitiveTier } from '@/modules/catalog/catalog-type';
import type {
  CompanionRank,
  CompetitiveRank,
  CompetitiveUpdate,
  MatchCard,
  MatchQueueType,
} from './companion-type';

type MmrSeasonalInfo = {
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
} | null;

type MmrResponse = {
  QueueSkills: MmrQueueSkills;
  LatestCompetitiveUpdate?: MmrLatestCompetitiveUpdate;
};

type MatchHistoryEntry = {
  MatchID: string;
  GameStartTime: number;
  QueueID?: string;
};

type MatchHistoryResponse = {
  History?: MatchHistoryEntry[];
};

type MatchTeam = {
  TeamID: string;
  RoundsWon: number;
  RoundsPlayed: number;
};

type MatchPlayerStats = {
  kills?: number;
  deaths?: number;
  assists?: number;
  score?: number;
  roundsPlayed?: number;
};

type MatchPlayer = {
  PUUID: string;
  TeamID: string;
  CharacterID: string;
  Stats?: MatchPlayerStats;
};

type MatchInfo = {
  MapID: string;
  GameLength: number;
  GameStartMillis: number;
  QueueID?: string;
  Teams?: MatchTeam[];
};

type MatchDetailsResponse = {
  MatchInfo?: MatchInfo;
  Players?: MatchPlayer[];
};

const MATCH_HISTORY_COUNT = 5;
const MATCH_QUEUE_MAP: Record<string, MatchQueueType> = {
  competitive: 'competitive',
  unrated: 'unrated',
  spikerush: 'spikerush',
  deathmatch: 'deathmatch',
  swiftplay: 'swiftplay',
  escalation: 'escalation',
  replication: 'replication',
  custom: 'custom',
  tournament: 'tournament',
  onefa: 'onefa',
  newmode: 'newmode',
  ggteam: 'ggteam',
};

export const CompanionService = {
  async fetchRank(account: Account): Promise<CompanionRank> {
    return StoredRiotSession.request(account, (tokens) => fetchRankWithTokens(account, tokens));
  },

  async fetchRecentMatches(account: Account): Promise<MatchCard[]> {
    return StoredRiotSession.request(account, (tokens) => fetchRecentMatchesWithTokens(account, tokens));
  },
};

async function fetchRankWithTokens(account: Account, tokens: AccountTokens): Promise<CompanionRank> {
  const headers = await buildRiotAuthorizedHeaders(tokens);
  const mmr = await riotFetch<MmrResponse>(
    `https://pd.${account.shard}.a.pvp.net/mmr/v1/players/${account.puuid}`,
    { headers },
  );

  const seasonal = mmr.QueueSkills.competitive?.SeasonalInfoBySeasonID;
  const latestSeasonKey = seasonal ? Object.keys(seasonal).sort().pop() : undefined;
  const seasonalInfo = latestSeasonKey ? seasonal![latestSeasonKey] : undefined;
  const tierNumber = seasonalInfo?.CompetitiveTier ?? seasonalInfo?.Rank ?? 0;
  const tier = await CatalogService.getCompetitiveTier(tierNumber);

  const rank: CompetitiveRank | null = seasonalInfo && tier
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
  const latestUpdate: CompetitiveUpdate | null = update
    ? {
        matchId: update.MatchID,
        rankedRatingEarned: update.RankedRatingEarned,
        tierBefore: update.TierBeforeUpdate,
        tierAfter: update.TierAfterUpdate,
      }
    : null;

  return { rank, latestUpdate, fetchedAt: new Date().toISOString() };
}

async function fetchRecentMatchesWithTokens(account: Account, tokens: AccountTokens): Promise<MatchCard[]> {
  const headers = await buildRiotAuthorizedHeaders(tokens);
  const history = await riotFetch<MatchHistoryResponse>(
    `https://pd.${account.shard}.a.pvp.net/match-history/v1/history/${account.puuid}?startIndex=0&endIndex=${MATCH_HISTORY_COUNT - 1}`,
    { headers },
  );

  const entries = history.History ?? [];
  if (entries.length === 0) {
    return [];
  }

  const rank = await CompanionService.fetchRank(account).catch(() => null);
  const latestCompetitiveMatchId = rank?.latestUpdate?.matchId ?? null;

  const [maps, agents] = await Promise.all([
    CatalogService.getMaps(),
    CatalogService.getAgents(),
  ]);

  const cards = await Promise.all(
    entries.map((entry) =>
      fetchMatchCard(account, tokens, entry, maps, agents, latestCompetitiveMatchId, rank?.latestUpdate?.rankedRatingEarned),
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
    const details = await riotFetch<MatchDetailsResponse>(
      `https://pd.${account.shard}.a.pvp.net/match-details/v1/matches/${entry.MatchID}`,
      { headers },
    );

    const matchInfo = details.MatchInfo;
    const players = details.Players ?? [];
    if (!matchInfo) {
      return null;
    }

    const player = players.find((candidate) => candidate.PUUID === account.puuid);
    if (!player) {
      return null;
    }

    const map = maps.get(matchInfo.MapID);
    const agent = agents.get(player.CharacterID);
    const queueType = matchInfo.QueueID ? MATCH_QUEUE_MAP[matchInfo.QueueID] ?? 'unknown' : 'unknown';
    const stats = player.Stats;
    const kills = stats?.kills ?? 0;
    const deaths = stats?.deaths ?? 0;
    const assists = stats?.assists ?? 0;

    const teams = matchInfo.Teams ?? [];
    const playerTeam = teams.find((team) => team.TeamID === player.TeamID);
    const opponentTeam = teams.find((team) => team.TeamID !== player.TeamID);
    const teamRounds = playerTeam?.RoundsWon ?? 0;
    const opponentRounds = opponentTeam?.RoundsWon ?? 0;
    const won = playerTeam && opponentTeam ? teamRounds > opponentRounds : null;

    const rankedRatingEarned = entry.MatchID === latestCompetitiveMatchId ? latestRrEarned : undefined;

    return {
      matchId: entry.MatchID,
      gameStartTime: new Date(entry.GameStartTime).toISOString(),
      queueType,
      mapName: map?.displayName ?? 'Unknown Map',
      mapIcon: map?.listViewIcon ?? undefined,
      mapSplash: map?.splash ?? undefined,
      agentName: agent?.displayName ?? 'Unknown Agent',
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

function toTierShortName(tier: CompetitiveTier): string {
  if (tier.tier === 0) return 'Unrated';
  if (tier.tier === 27) return 'Radiant';
  const division = tier.division.replace('ECompetitiveDivision::', '').toLowerCase();
  const tierNum = tier.tierName.match(/\d+$/)?.[0] ?? '';
  const divisionShort = division.charAt(0).toUpperCase() + division.slice(1, 3);
  return tierNum ? `${divisionShort} ${tierNum}` : divisionShort;
}
