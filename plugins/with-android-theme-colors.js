const { withAndroidColors } = require('@expo/config-plugins');

const PRIMARY_COLOR = '#E6112E';

const COLORS = [
  { name: 'iconBackground', value: PRIMARY_COLOR },
  { name: 'colorPrimary', value: PRIMARY_COLOR },
];

function withAndroidThemeColors(config) {
  return withAndroidColors(config, (exportedConfig) => {
    const colors = exportedConfig.modResults.resources.color ?? [];

    const byName = new Map(colors.map((c) => [c.name, c]));

    for (const { name, value } of COLORS) {
      const existing = byName.get(name);
      if (existing) {
        existing._ = value;
      } else {
        const entry = { name, _: value };
        colors.push(entry);
        byName.set(name, entry);
      }
    }

    exportedConfig.modResults.resources.color = colors;
    return exportedConfig;
  });
}

module.exports = withAndroidThemeColors;
