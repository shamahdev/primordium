import React from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Spacing } from "@/commons/constants/theme";

export const CatalogSectionHeader = React.memo(function CatalogSectionHeader({
	title,
}: {
	title: string;
}) {
	return (
		<ThemedText
			type="small"
			themeColor="textSecondary"
			style={styles.sectionHeader}
		>
			{title.toUpperCase()}
		</ThemedText>
	);
});

const styles = StyleSheet.create({
	sectionHeader: {
		letterSpacing: 1.4,
		paddingTop: Spacing.three,
		paddingBottom: Spacing.one,
	},
});
