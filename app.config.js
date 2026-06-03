const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

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
  name: getAppName(),
  plugins: [...(config.plugins ?? []), 'expo-background-task', 'expo-notifications'],
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
});
