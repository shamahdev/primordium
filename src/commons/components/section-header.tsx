import type React from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Spacing } from "@/commons/constants/theme";

type SectionHeaderProps = {
	title: string;
	trailing?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, trailing, style }: SectionHeaderProps) {
	return (
		<View style={[styles.row, style]}>
			<ThemedText type="small" themeColor="textSecondary" style={styles.title}>
				{title.toUpperCase()}
			</ThemedText>
			{trailing}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	title: {
		letterSpacing: 1.4,
	},
});
