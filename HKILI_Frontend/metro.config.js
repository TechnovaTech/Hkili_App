const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for better asset handling
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};

// Ensure proper asset extensions
config.resolver.assetExts.push('svg');

module.exports = config;