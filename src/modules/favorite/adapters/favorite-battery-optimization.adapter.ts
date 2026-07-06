import * as Battery from "expo-battery";
import Constants from "expo-constants";
import * as IntentLauncher from "expo-intent-launcher";
import { Linking, Platform } from "react-native";

export async function getBatteryOptimizationStatus(): Promise<boolean> {
	if (Platform.OS !== "android") return true;
	try {
		const isEnabled = await Battery.isBatteryOptimizationEnabledAsync();
		return !isEnabled;
	} catch {
		return true;
	}
}

export async function requestIgnoreBatteryOptimizations(): Promise<void> {
	if (Platform.OS !== "android") return;

	const applicationId = Constants.expoConfig?.android?.package ?? null;
	if (!applicationId) {
		await openBatteryOptimizationSettings();
		return;
	}

	try {
		await IntentLauncher.startActivityAsync(
			IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
			{ data: `package:${applicationId}` },
		);
	} catch {
		await openBatteryOptimizationSettings();
	}
}

export async function openBatteryOptimizationSettings(): Promise<void> {
	if (Platform.OS !== "android") return;

	try {
		await IntentLauncher.startActivityAsync(
			IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS,
		);
	} catch {
		await Linking.openSettings();
	}
}
