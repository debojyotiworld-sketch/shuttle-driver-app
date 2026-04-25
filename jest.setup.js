/* global jest */
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('@rnmapbox/maps', () => {
  const React = require('react');

  return {
    __esModule: true,
    default: {
      MapView: (props) => React.createElement('MapView', props, props.children),
      Camera: (props) => React.createElement('Camera', props, props.children),
      MarkerView: (props) => React.createElement('MarkerView', props, props.children),
    },
  };
}, { virtual: true });

jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn(),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('MapView', props, props.children),
    Marker: (props) => React.createElement('Marker', props, props.children),
    UrlTile: (props) => React.createElement('UrlTile', props, props.children),
  };
});