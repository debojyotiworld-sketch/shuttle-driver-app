import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface ActiveRideProps {
  navigation: any;
  route: any;
}

export default function ActiveRideScreen({ navigation, route }: ActiveRideProps) {
  const { trip, driverLocation: initialLocation, passengerBoarded } = route.params;
  const mapRef = useRef<MapView>(null);

  const [driverLocation, setDriverLocation] = useState<LocationCoords>(initialLocation);
  const [destinationLocation] = useState<LocationCoords>(trip.destination);
  const [passengerLocation] = useState<LocationCoords>(trip.source);
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState('--');

  useEffect(() => {
    let watchId: number | null = null;

    const startTracking = async () => {
      try {
        watchId = Geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setDriverLocation({ latitude, longitude });

            // Calculate distance to destination
            const dist = calculateDistance(
              latitude,
              longitude,
              destinationLocation.latitude,
              destinationLocation.longitude
            );
            setDistance(dist);

            // Estimate time (assuming average speed of 40 km/h)
            const estimatedMinutes = Math.round((dist / 40) * 60);
            setEta(estimatedMinutes + ' min');

            // Check if reached destination (within 100 meters)
            if (dist < 0.1) {
              Alert.alert('Trip Complete', 'You have reached the drop-off location.');
            }
          },
          (error) => console.error('Error watching location:', error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
            distanceFilter: 10,
          }
        );
      } catch (error) {
        console.error('Tracking error:', error);
      }
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [destinationLocation]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride',
      'Are you sure you want to complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            navigation.popToTop();
            Alert.alert('Success', 'Ride completed successfully!');
          },
        },
      ]
    );
  };

  const routeCoordinates = [driverLocation, destinationLocation];

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (driverLocation.latitude + destinationLocation.latitude) / 2,
          longitude: (driverLocation.longitude + destinationLocation.longitude) / 2,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        zoomControlEnabled={true}
      >
        {/* Driver Marker */}
        <Marker
          coordinate={driverLocation}
          title="Your Location"
          pinColor="#2196F3"
        >
          <View style={styles.driverMarkerContainer}>
            <View style={styles.driverMarker} />
          </View>
        </Marker>

        {/* Passenger Marker */}
        <Marker
          coordinate={passengerLocation}
          title="Passenger"
          pinColor="#FFC107"
        >
          <View style={styles.passengerMarkerContainer}>
            <Text style={styles.markerEmoji}>👤</Text>
          </View>
        </Marker>

        {/* Destination Marker */}
        <Marker
          coordinate={destinationLocation}
          title="Drop-off"
          pinColor="#4CAF50"
        >
          <View style={styles.destinationMarkerContainer}>
            <Text style={styles.markerEmoji}>🏁</Text>
          </View>
        </Marker>

        {/* Route Polyline */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#2196F3"
          strokeWidth={4}
        />
      </MapView>

      {/* Trip Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View>
            <Text style={styles.statusTitle}>Trip in Progress</Text>
            <Text style={styles.passengerName}>{trip.passenger} on Board</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        {/* Distance and ETA */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Distance to Destination</Text>
            <Text style={styles.metricValue}>
              {distance < 1 ? (distance * 1000).toFixed(0) + ' m' : distance.toFixed(2) + ' km'}
            </Text>
          </View>
          <View style={[styles.metricItem, styles.metricBorder]}>
            <Text style={styles.metricLabel}>Estimated Time</Text>
            <Text style={styles.metricValue}>{eta}</Text>
          </View>
        </View>

        {/* Destination Info */}
        <View style={styles.destinationInfo}>
          <Text style={styles.infoLabel}>📍 Drop-off</Text>
          <Text style={styles.infoValue}>{trip.dropoffAddress}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={handleCompleteRide}
        >
          <Text style={styles.buttonText}>Complete Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  driverMarkerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  driverMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  passengerMarkerContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  destinationMarkerContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  markerEmoji: {
    fontSize: 24,
  },
  statusCard: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  passengerName: {
    fontSize: 13,
    color: '#666',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  metricBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  destinationInfo: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoLabel: {
    fontSize: 12,
    color: '#1565C0',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
