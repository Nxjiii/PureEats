const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      path: path.resolve(__dirname, 'node_modules/path'),
      fs: path.resolve(__dirname, 'node_modules/fs'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
