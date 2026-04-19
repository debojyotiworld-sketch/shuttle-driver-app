import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

export default function MapScreen({ route }: any) {
  const [location, setLocation] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);

  const trip = route?.params?.trip;

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
    const init = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Geolocation.watchPosition(
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
  }, []);

  useEffect(() => {
    if (trip?.source && trip?.destination) {
      const fetchRoute = async () => {
        try {
          const { source, destination } = trip;
          const url = `https://router.project-osrm.org/route/v1/driving/${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((coord: any) => ({
              latitude: coord[1],
              longitude: coord[0],
            }));
            setRouteCoordinates(coords);
          }
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      };

      fetchRoute();
    }
  }, [trip]);

  if (!location && !trip) return <View style={styles.container} />;

  const initialRegion = trip?.source
    ? {
        latitude: (trip.source.latitude + trip.destination.latitude) / 2,
        longitude: (trip.source.longitude + trip.destination.longitude) / 2,
        latitudeDelta: Math.abs(trip.source.latitude - trip.destination.latitude) * 2 || 0.05,
        longitudeDelta: Math.abs(trip.source.longitude - trip.destination.longitude) * 2 || 0.05,
      }
    : {
        latitude: location?.latitude || 37.78825,
        longitude: location?.longitude || -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
    >
      {/* OpenStreetMap Tiles */}
      <UrlTile
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
      />

      {/* Driver Marker */}
      {location && (
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You"
        />
      )}

      {/* Trip Markers and Polyline */}
      {trip && (
        <>
          <Marker coordinate={trip.source} title="Pickup" pinColor="green" />
          <Marker coordinate={trip.destination} title="Dropoff" pinColor="red" />
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#000" // black
              strokeWidth={4}
            />
          )}
        </>
      )}
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