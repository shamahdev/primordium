import {
	Pressable,
	type PressableProps,
	type StyleProp,
	StyleSheet,
	type ViewStyle,
} from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";

type PrimaryButtonProps = Omit<PressableProps, "style"> & {
	label: string;
	style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
	label,
	disabled,
	style,
	...props
}: PrimaryButtonProps) {
	const theme = useTheme();

	return (
		<Pressable
			disabled={disabled}
			style={({ pressed }) => [
				styles.button,
				{
					backgroundColor: theme.primary,
					opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
				},
				style,
			]}
			{...props}
		>
			<ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>
				{label}
			</ThemedText>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		minHeight: 44,
		borderRadius: Spacing.one,
		paddingHorizontal: Spacing.three,
		alignItems: "center",
		justifyContent: "center",
	},
});
