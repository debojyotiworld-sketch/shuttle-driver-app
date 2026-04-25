import React, { useEffect, useState } from 'react';
import { StyleSheet, View, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

export default function MapScreen() {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    async function requestLocationPermission() {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location to show it on the map.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setHasLocationPermission(true);
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        // iOS permissions are usually handled via Info.plist and Geolocation API,
        // but react-native-maps can trigger the prompt when showsUserLocation={true}.
        setHasLocationPermission(true);
      }
    }

    requestLocationPermission();
  }, []);

  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const pickupLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
  };

  const destinationLocation = {
    latitude: 37.79825,
    longitude: -122.4424,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        mapType="none" // Important for OSM
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={true}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        <Marker coordinate={pickupLocation} title="Pickup" pinColor="blue" />
        <Marker coordinate={destinationLocation} title="Destination" pinColor="red" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
