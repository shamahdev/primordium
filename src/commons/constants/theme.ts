/**
 * Below are the colors that are used in the app. The app is dark-only.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/commons/styles/global.css";

import { Platform } from "react-native";

export const Colors = {
	dark: {
		text: "#ffffff",
		primary: "#E6112E",
		primaryForeground: "#ffffff",
		textSecondary: "#B0B4BA",
		accent: "#5A9FE2",
		accentForeground: "#ffffff",
		background: "#000000",
		backgroundElement: "#212225",
		backgroundSelected: "#2E3135",
	},
} as const;

export const RarityColors = {
	select: "#5A9FE2",
	deluxe: "#009587",
	premium: "#D1548D",
	exclusive: "#F5955B",
	ultra: "#FAD663",
} as const;

export const StatusColors = {
	success: "#6AE2AF",
	danger: "#E2616A",
} as const;

export const OwnedAccent = "#7C8B9C";

export type ThemeColor = keyof typeof Colors.dark;

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: "system-ui",
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: "ui-serif",
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: "ui-rounded",
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "var(--font-display)",
		serif: "var(--font-serif)",
		rounded: "var(--font-rounded)",
		mono: "var(--font-mono)",
	},
});

export const Spacing = {
	half: 2,
	one: 4,
	two: 8,
	three: 16,
	four: 24,
	five: 32,
	six: 64,
} as const;

export const Radius = {
	/** Cards, rows, buttons, inputs, thumbnails */
	small: 8,
	/** Sheets, modals, large containers */
	large: 16,
} as const;

export const MaxContentWidth = 800;
