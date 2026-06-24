const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
const IS_PRODUCTION = !IS_DEV && !IS_PREVIEW;

function getUniqueIdentifier() {
  if (IS_DEV) {
    return 'dev.shamah.primordium.dev';
  }
  if (IS_PREVIEW) {
    return 'dev.shamah.primordium.preview';
  }

  return 'dev.shamah.primordium';
};

function getAppName() {
  if (IS_DEV) {
    return 'Primordium (Dev)';
  }
  if (IS_PREVIEW) {
    return 'Primordium (Preview)';
  }

  return 'Primordium';
};

export default ({ config }) => ({
  ...config,
  newArchEnabled: true,
  jsEngine: 'hermes',
  name: getAppName(),
  plugins: [
    ...(config.plugins ?? []),
    '@react-native-runtimes/core',
    [
      'expo-build-properties',
      {
        android: {
          ...(IS_PRODUCTION ? { buildArchs: ['arm64-v8a'] } : {}),
          enableBundleCompression: true,
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
    'expo-background-task',
    'expo-notifications',
  ],
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
    permissions: [
      ...(config.android?.permissions ?? []),
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    ],
  },
});
