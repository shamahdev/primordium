// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withThreadedRuntime } = require('@react-native-runtimes/core/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withThreadedRuntime(config, {
  roots: ['src'],
  generatedDir: '.threaded-runtime',
  generatedEntry: 'entry.js',
});
