const { withAndroidColors } = require('@expo/config-plugins');

const PRIMARY_COLOR = '#D32936';

const COLORS = [
  { name: 'iconBackground', value: PRIMARY_COLOR },
  { name: 'colorPrimary', value: PRIMARY_COLOR },
];

function withAndroidThemeColors(config) {
  return withAndroidColors(config, (exportedConfig) => {
    const colors = exportedConfig.modResults.resources.color ?? [];

    for (const { name, value } of COLORS) {
      const existing = colors.find((c) => c.name === name);
      if (existing) {
        existing._ = value;
      } else {
        colors.push({ name, _: value });
      }
    }

    exportedConfig.modResults.resources.color = colors;
    return exportedConfig;
  });
}

module.exports = withAndroidThemeColors;
