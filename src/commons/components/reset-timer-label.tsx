import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { View } from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Spacing } from "@/commons/constants/theme";

type ResetTimerLabelProps = {
	expiresAt: string;
	prefix?: string;
};

export function ResetTimerLabel({
	expiresAt,
	prefix = "Reset in",
}: ResetTimerLabelProps) {
	const [now, setNow] = React.useState(() => Date.now());

	React.useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<View
			style={{ flexDirection: "row", alignItems: "center", gap: Spacing.half }}
		>
			<Ionicons name="time-outline" size={12} color="#888888" />
			<ThemedText type="xsmall" themeColor="textSecondary">
				{prefix} {formatRemaining(expiresAt, now)}
			</ThemedText>
		</View>
	);
}

function formatRemaining(expiresAt: string, now: number) {
	const diff = Math.max(new Date(expiresAt).getTime() - now, 0);
	const totalSeconds = Math.floor(diff / 1000);
	const totalMinutes = Math.floor(totalSeconds / 60);
	const totalHours = Math.floor(totalMinutes / 60);
	const days = Math.floor(totalHours / 24);
	const hours = totalHours % 24;
	const minutes = totalMinutes % 60;

	if (days > 0) {
		return `${days}d ${hours}h ${minutes}m`;
	}
	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
}
