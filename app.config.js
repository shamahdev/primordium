export default ({ config }) => ({
	...config,
	newArchEnabled: true,
	jsEngine: "hermes",
	name: "Primordium",
	plugins: [
		...(config.plugins ?? []),
		[
			"expo-build-properties",
			{
				android: {
					buildArchs: ["arm64-v8a"],
					enableBundleCompression: true,
					enableMinifyInReleaseBuilds: true,
					enableShrinkResourcesInReleaseBuilds: true,
				},
			},
		],
		"expo-background-task",
		[
			"expo-notifications",
			{
				icon: "./assets/images/monochrome-icon.png",
				color: "#E6112E",
			},
		],
	],
	ios: {
		...config.ios,
		bundleIdentifier: "dev.shamah.primordium",
	},
	android: {
		...config.android,
		package: "dev.shamah.primordium",
		permissions: [
			...(config.android?.permissions ?? []),
			"android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
		],
	},
});
