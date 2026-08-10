import { useFocusEffect } from "expo-router";
import React from "react";

import { useAccountStore } from "@/modules/account/account-store";
import { CompanionService } from "./companion-service";
import type { CompanionRank, MatchCard } from "./companion-type";

export function useCompanionViewModel() {
	const activeAccountId = useAccountStore((state) => state.activeAccountId);
	const accountSnapshot = useAccountStore((state) =>
		state.accounts.find((item) => item.id === state.activeAccountId),
	);
	const setRankSnapshot = useAccountStore((state) => state.setRankSnapshot);
	const [rank, setRank] = React.useState<CompanionRank | null>(
		() => accountSnapshot?.rankSnapshot ?? null,
	);
	const [rankLoading, setRankLoading] = React.useState(false);
	const [rankError, setRankError] = React.useState<string | null>(null);
	const [matches, setMatches] = React.useState<MatchCard[]>([]);
	const [matchesLoading, setMatchesLoading] = React.useState(false);
	const [matchesError, setMatchesError] = React.useState<string | null>(null);

	// Keep rank in sync with persisted snapshot when account switches
	React.useEffect(() => {
		setRank(accountSnapshot?.rankSnapshot ?? null);
	}, [accountSnapshot?.rankSnapshot]);

	const fetchRank = React.useCallback(async () => {
		const account = useAccountStore
			.getState()
			.accounts.find((item) => item.id === activeAccountId);
		if (!account || account.status === "needsReauth") {
			return;
		}

		setRankLoading(true);
		setRankError(null);
		try {
			const nextRank = await CompanionService.fetchRank(account);
			setRank(nextRank);
			setRankSnapshot(account.id, nextRank);
		} catch (error) {
			setRankError(
				error instanceof Error ? error.message : "Could not load competitive rank.",
			);
		} finally {
			setRankLoading(false);
		}
	}, [activeAccountId, setRankSnapshot]);

	const fetchMatches = React.useCallback(async () => {
		const account = useAccountStore
			.getState()
			.accounts.find((item) => item.id === activeAccountId);
		if (!account || account.status === "needsReauth") {
			return;
		}

		setMatchesLoading(true);
		setMatchesError(null);
		try {
			const nextMatches = await CompanionService.fetchRecentMatches(account);
			setMatches(nextMatches);
		} catch (error) {
			setMatchesError(
				error instanceof Error ? error.message : "Could not load recent matches.",
			);
		} finally {
			setMatchesLoading(false);
		}
	}, [activeAccountId]);

	const refreshAll = React.useCallback(async () => {
		await Promise.all([fetchRank(), fetchMatches()]);
	}, [fetchRank, fetchMatches]);

	useFocusEffect(
		React.useCallback(() => {
			void fetchRank();
			void fetchMatches();
		}, [fetchRank, fetchMatches]),
	);

	return {
		rank,
		rankLoading,
		rankError,
		matches,
		matchesLoading,
		matchesError,
		refreshRank: fetchRank,
		refreshMatches: fetchMatches,
		refreshAll,
	};
}
