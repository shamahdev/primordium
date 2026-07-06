export type CompetitiveRank = {
  tierNumber: number;
  tierName: string;
  tierShortName: string;
  color: string;
  rankedRating: number;
  wins: number;
  games: number;
};

export type CompetitiveUpdate = {
  matchId: string | null;
  rankedRatingEarned: number;
  tierBefore: number;
  tierAfter: number;
};

export type CompanionRank = {
  rank: CompetitiveRank | null;
  latestUpdate: CompetitiveUpdate | null;
  fetchedAt: string;
};

export type MatchQueueType = 'competitive' | 'unrated' | 'spikerush' | 'deathmatch' | 'swiftplay' | 'escalation' | 'replication' | 'custom' | 'tournament' | 'onefa' | 'newmode' | 'ggteam' | 'unknown';

export type MatchCard = {
  matchId: string;
  gameStartTime: string;
  queueType: MatchQueueType;
  mapName: string;
  mapIcon?: string;
  mapSplash?: string;
  agentName: string;
  agentIcon?: string;
  kills: number;
  deaths: number;
  assists: number;
  won: boolean | null;
  teamScore: string;
  rankedRatingEarned?: number;
};
