import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";

type ErrorBannerProps = {
	message: string;
	actionLabel?: string;
	onPress?: () => void;
};

export function ErrorBanner({
	message,
	actionLabel,
	onPress,
}: ErrorBannerProps) {
	const theme = useTheme();
	const content = (
		<>
			<ThemedText
				type="xsmall"
				numberOfLines={2}
				style={[styles.text, { color: theme.primaryForeground }]}
			>
				{message}
			</ThemedText>
			{actionLabel ? (
				<ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>
					{actionLabel}
				</ThemedText>
			) : null}
		</>
	);

	if (onPress) {
		return (
			<Pressable
				style={[styles.banner, { backgroundColor: theme.primary }]}
				onPress={onPress}
			>
				{content}
			</Pressable>
		);
	}

	return (
		<View style={[styles.banner, { backgroundColor: theme.primary }]}>
			{content}
		</View>
	);
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: Spacing.four,
		paddingVertical: Spacing.two,
		gap: Spacing.two,
	},
	text: {
		flex: 1,
	},
});
