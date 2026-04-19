import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('react-native-maps', () => {
  const React = require('react');
  const MapView = (props) => React.createElement('MapView', props, props.children);
  MapView.Marker = (props) => React.createElement('Marker', props, props.children);
  MapView.Polyline = (props) => React.createElement('Polyline', props, props.children);
  MapView.UrlTile = (props) => React.createElement('UrlTile', props, props.children);
  return MapView;
});

jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn(),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));
