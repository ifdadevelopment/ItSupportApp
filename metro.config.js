const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("xlsx", "xls", "csv", "json");

config.resolver.sourceExts = [
  "js",
  "jsx",
  "json",
  "ts",
  "tsx"
];

module.exports = config;
