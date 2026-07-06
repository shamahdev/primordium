const { withAppBuildGradle } = require('@expo/config-plugins');

const FLAVORS = {
  production: { suffix: '', name: 'Primordium' },
  preview: { suffix: '.preview', name: 'Primordium (Preview)' },
  development: { suffix: '.dev', name: 'Primordium (Dev)' },
};

function buildFlavorsBlock() {
  const entries = Object.entries(FLAVORS)
    .map(([name, { suffix, name: label }]) => {
      const lines = [
        `        ${name} {`,
        `            dimension "env"`,
        suffix ? `            applicationIdSuffix "${suffix}"` : null,
        `            resValue "string", "app_name", "${label}"`,
        `        }`,
      ].filter(Boolean);
      return lines.join('\n');
    })
    .join('\n');

  return `
    flavorDimensions "env"
    productFlavors {
${entries}
    }
`;
}

function withAndroidFlavors(config) {
  return withAppBuildGradle(config, (mod) => {
    const contents = mod.modResults.contents;

    if (contents.includes('flavorDimensions')) {
      return mod;
    }

    mod.modResults.contents = contents.replace(
      /(\n\s*signingConfigs \{)/,
      `\n${buildFlavorsBlock()}$1`,
    );

    return mod;
  });
}

module.exports = withAndroidFlavors;
