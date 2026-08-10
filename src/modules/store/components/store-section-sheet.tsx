import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetFlatList,
	BottomSheetModal,
} from "@gorhom/bottom-sheet";
import type React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ResetTimerLabel } from "@/commons/components/reset-timer-label";
import { ThemedText } from "@/commons/components/themed-text";
import { Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import { getStoreGridColumnCount } from "@/modules/store/components/store-grid";
import { StoreGridCard } from "@/modules/store/components/store-grid-card";
import type { StoreCarouselCard } from "@/modules/store/store-type";

type StoreSectionSheetProps = {
	section: StoreCarouselCard | null;
	onDismiss: () => void;
	onBeforeNavigate?: () => void;
	ref?: React.Ref<BottomSheetModal>;
};

function renderBackdrop(props: BottomSheetBackdropProps) {
	return (
		<BottomSheetBackdrop
			{...props}
			disappearsOnIndex={-1}
			appearsOnIndex={0}
			pressBehavior="close"
		/>
	);
}

export function StoreSectionSheet({
	section,
	onDismiss,
	onBeforeNavigate,
	ref,
}: StoreSectionSheetProps) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const { width: windowWidth } = useWindowDimensions();
	const columns = getStoreGridColumnCount(windowWidth);

	return (
		<BottomSheetModal
			ref={ref}
			snapPoints={["82%"]}
			enableDynamicSizing={false}
			enablePanDownToClose
			backdropComponent={renderBackdrop}
			onDismiss={onDismiss}
			backgroundStyle={{ backgroundColor: theme.background }}
			handleIndicatorStyle={{
				backgroundColor: theme.textSecondary,
				opacity: 0.4,
			}}
		>
			{section ? (
				<View style={styles.header}>
					<ThemedText type="subtitle">{section.title.toUpperCase()}</ThemedText>
					<ResetTimerLabel expiresAt={section.expiresAt} prefix="Leaves in" />
				</View>
			) : null}
			<BottomSheetFlatList
				key={columns}
				data={section?.items ?? []}
				keyExtractor={(item) => item.id}
				numColumns={columns}
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + Spacing.four },
				]}
				columnWrapperStyle={styles.gridRow}
				renderItem={({ item }) => (
					<View style={styles.gridItem}>
						<StoreGridCard item={item} onBeforeNavigate={onBeforeNavigate} />
					</View>
				)}
				showsVerticalScrollIndicator={false}
			/>
		</BottomSheetModal>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: Spacing.four,
		paddingBottom: Spacing.two,
	},
	content: {
		paddingHorizontal: Spacing.four,
		paddingTop: Spacing.two,
		gap: Spacing.two,
	},
	gridRow: {
		gap: Spacing.two,
	},
	gridItem: {
		flex: 1,
	},
});
