import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";

export const CatalogFilterChip = React.memo(function CatalogFilterChip({
	label,
	selected,
	color,
	onPress,
}: {
	label: string;
	selected: boolean;
	color?: string;
	onPress: () => void;
}) {
	const theme = useTheme();
	const accent = color ?? theme.primary;
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ selected }}
			style={[
				styles.chip,
				{
					backgroundColor: selected ? accent : theme.backgroundElement,
					borderColor: selected ? accent : theme.backgroundSelected,
				},
			]}
		>
			<ThemedText
				type="xsmall"
				style={{ color: selected ? theme.primaryForeground : accent }}
			>
				{label}
			</ThemedText>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	chip: {
		minHeight: 44,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 999,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
	},
});
