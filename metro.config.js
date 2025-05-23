const {getDefaultConfig} = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  return {
    ...config,
    resolver: {
      ...config.resolver,
      assetExts: [...config.resolver.assetExts, 'png'],
      sourceExts: [...config.resolver.sourceExts, 'cjs'],
    },
  };
})();
