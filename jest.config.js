module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-safe-area-context|react-native-screens|react-native-geolocation-service|react-native-qrcode-svg|react-native-maps|react-native-url-polyfill|@react-native-async-storage|@supabase|react-native-vector-icons|@sayem314)/)',
  ],
};
