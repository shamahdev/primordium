import React from "react";
import { StyleSheet } from "react-native";

import { SectionHeader } from "@/commons/components/section-header";
import { Spacing } from "@/commons/constants/theme";

export const CatalogSectionHeader = React.memo(function CatalogSectionHeader({
	title,
}: {
	title: string;
}) {
	return <SectionHeader title={title} style={styles.sectionHeader} />;
});

const styles = StyleSheet.create({
	sectionHeader: {
		paddingTop: Spacing.three,
		paddingBottom: Spacing.one,
	},
});
