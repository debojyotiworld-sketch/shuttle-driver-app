import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';

export default function MapScreen({ route }: any) {
  const [location, setLocation] = useState<any>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);

  const trip = route?.params?.trip;

  // 🔐 Permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // 📍 Live location tracking
  useEffect(() => {
    let watchId: number | null = null;
    let isActive = true;

    const init = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission || !isActive) return;

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

  // 🛣️ Fetch route from OSRM
  useEffect(() => {
    if (trip?.source && trip?.destination) {
      const fetchRoute = async () => {
        try {
          const { source, destination } = trip;

          const url = `https://router.project-osrm.org/route/v1/driving/${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.routes?.length > 0) {
            setRouteGeoJSON({
              type: 'Feature',
              geometry: data.routes[0].geometry,
            });
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      };

      fetchRoute();
    }
  }, [trip]);

  // 🎯 Camera center
  const getCenter = () => {
    if (trip?.source && trip?.destination) {
      return [
        (trip.source.longitude + trip.destination.longitude) / 2,
        (trip.source.latitude + trip.destination.latitude) / 2,
      ];
    }
    if (location) {
      return [location.longitude, location.latitude];
    }
    return [88.3639, 22.5726]; // Kolkata fallback
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
      >
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={getCenter()}
        />

        {/* 🛣️ Route Line */}
        {routeGeoJSON && (
          <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
            <Mapbox.LineLayer
              id="routeLine"
              style={{
                lineColor: '#000',
                lineWidth: 4,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* 📍 Driver Marker */}
        {location && (
          <Mapbox.PointAnnotation
            id="driver"
            coordinate={[location.longitude, location.latitude]}
          >
            <View style={styles.marker} />
          </Mapbox.PointAnnotation>
        )}

        {/* 📍 Pickup */}
        {trip?.source && (
          <Mapbox.PointAnnotation
            id="pickup"
            coordinate={[trip.source.longitude, trip.source.latitude]}
          >
            <View style={[styles.marker, { backgroundColor: 'green' }]} />
          </Mapbox.PointAnnotation>
        )}

        {/* 📍 Drop */}
        {trip?.destination && (
          <Mapbox.PointAnnotation
            id="drop"
            coordinate={[trip.destination.longitude, trip.destination.latitude]}
          >
            <View style={[styles.marker, { backgroundColor: 'red' }]} />
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 12,
    height: 12,
    backgroundColor: 'blue',
    borderRadius: 6,
  }
});