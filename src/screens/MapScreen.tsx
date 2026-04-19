import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

export default function MapScreen() {
  const [location, setLocation] = useState<any>(null);

  // Request permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    let watchId: number | null = null;
    let isActive = true;

    const init = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission || !isActive) {
        return;
      }

      watchId = Geolocation.watchPosition(
        position => {
          setLocation(position.coords);
        },
        error => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 5000,
        }
      );
    };

    init();

    return () => {
      isActive = false;
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  if (!location) return <View style={styles.container} />;

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {/* OpenStreetMap Tiles */}
      <UrlTile
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
      />

      {/* Driver Marker */}
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="You"
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});