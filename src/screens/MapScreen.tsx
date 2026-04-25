import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface TripData {
  id: string;
  passenger: string;
  source: Coordinate;
  destination: Coordinate;
  pickupAddress: string;
  dropoffAddress: string;
}

interface MapScreenProps {
  navigation: any;
  route: {
    params: {
      trip: TripData;
    };
  };
}

export default function MapScreen({ navigation, route }: MapScreenProps) {
  const { trip } = route.params;
  const mapRef = useRef<MapView>(null);

  // Location state
  const [driverLocation, setDriverLocation] = useState<Coordinate>({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [passengerLocation] = useState<Coordinate>(trip.source);
  const [destinationLocation] = useState<Coordinate>(trip.destination);
  const [isLoading, setIsLoading] = useState(true);
  const [rideStarted, setRideStarted] = useState(false);
  const [passengerArrived, setPassengerArrived] = useState(false);
  const [distance, setDistance] = useState(0);

  // Get permission and start location tracking
  useEffect(() => {
    let watchId: number | null = null;
    let isActive = true;

    const requestLocationPermission = async () => {
      try {
        // Get initial location
        Geolocation.getCurrentPosition(
          (position) => {
            if (!isActive) return;
            const { latitude, longitude } = position.coords;
            setDriverLocation({ latitude, longitude });
            setIsLoading(false);

            // Center map on driver location
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude,
                  longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                },
                1000
              );
            }
          },
          (error) => {
            if (!isActive) return;
            console.error('Error getting location:', error);
            setIsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Watch for location updates
        watchId = Geolocation.watchPosition(
          (position) => {
            if (!isActive) return;
            const { latitude, longitude } = position.coords;
            setDriverLocation({ latitude, longitude });

            if (mapRef.current) {
              mapRef.current.animateCamera(
                { center: { latitude, longitude } },
                { duration: 500 }
              );
            }

            // Calculate distance to passenger pickup
            const dist = calculateDistance(
              latitude,
              longitude,
              passengerLocation.latitude,
              passengerLocation.longitude
            );
            setDistance(dist);

            // Check if driver reached passenger (within 50 meters)
            if (dist < 0.05 && !passengerArrived) {
              setPassengerArrived(true);
              Alert.alert('Arrived at Pickup', 'You have reached the passenger location.');
            }
          },
          (error) => console.error('Error watching location:', error),
          {
            enableHighAccuracy: true,
            distanceFilter: 10, // Update every 10 meters
          }
        );
      } catch (error) {
        if (!isActive) return;
        console.error('Permission error:', error);
        setIsLoading(false);
      }
    };

    requestLocationPermission();

    return () => {
      isActive = false;
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [passengerLocation, passengerArrived]);

  // Calculate distance between two coordinates (in km)
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

  const handleStartTrip = () => {
    setRideStarted(true);
    Alert.alert('Navigation Started', 'Navigating to passenger pickup location.');
  };

  const handleArriveAtPassenger = () => {
    if (passengerArrived) {
      // Navigate to passenger boarding verification
      navigation.navigate('PassengerBoarding', {
        trip,
        driverLocation,
      });
    }
  };

  const handleEndTrip = () => {
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'End Trip',
          onPress: () => {
            navigation.popToTop();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  const dynamicRouteCoordinates = !passengerArrived
    ? [driverLocation, passengerLocation]
    : [driverLocation, destinationLocation];

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        zoomControlEnabled={true}
        zoomTapEnabled={true}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        {/* Driver Marker - Current Location */}
        <Marker
          coordinate={driverLocation}
          title="Your Location"
          description="Current driver position"
          pinColor="#2196F3"
        >
          <View style={styles.driverMarkerContainer}>
            <View style={styles.driverMarker} />
          </View>
        </Marker>

        {/* Passenger Pickup Location */}
        {!rideStarted ? (
          <Marker
            coordinate={passengerLocation}
            title="Passenger Pickup"
            description={trip.pickupAddress}
            pinColor="#FF5252"
          >
            <View style={styles.passengerMarkerContainer}>
              <Text style={styles.markerEmoji}>📍</Text>
            </View>
          </Marker>
        ) : null}

        {/* Destination Marker - Only show after passenger boards */}
        {rideStarted && passengerArrived && (
          <Marker
            coordinate={destinationLocation}
            title="Drop-off Location"
            description={trip.dropoffAddress}
            pinColor="#4CAF50"
          >
            <View style={styles.destinationMarkerContainer}>
              <Text style={styles.markerEmoji}>🏁</Text>
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        <Polyline
          coordinates={dynamicRouteCoordinates}
          strokeColor="#2196F3"
          strokeWidth={4}
          lineDashPattern={[5]}
        />
      </MapView>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          {!rideStarted ? 'Ready to Start Trip' : passengerArrived ? 'Arrived at Pickup' : 'En Route to Passenger'}
        </Text>
        <Text style={styles.passengerInfo}>Passenger: {trip.passenger}</Text>

        {rideStarted && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceLabel}>Distance to Pickup:</Text>
            <Text style={styles.distance}>
              {distance < 1 ? (distance * 1000).toFixed(0) + ' m' : distance.toFixed(2) + ' km'}
            </Text>
          </View>
        )}

        {!rideStarted && (
          <Text style={styles.addressText}>
            Pickup: {trip.pickupAddress}
          </Text>
        )}

        {rideStarted && passengerArrived && (
          <Text style={styles.arrivedText}>✓ You've arrived at the passenger location</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!rideStarted ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={handleStartTrip}
          >
            <Text style={styles.buttonText}>Start Navigation</Text>
          </TouchableOpacity>
        ) : passengerArrived ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.nextButton]}
              onPress={handleArriveAtPassenger}
            >
              <Text style={styles.buttonText}>Continue to Verification</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleEndTrip}
            >
              <Text style={styles.buttonText}>Cancel Trip</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleEndTrip}
          >
            <Text style={styles.buttonText}>Cancel Trip</Text>
          </TouchableOpacity>
        )}
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5252',
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
    fontSize: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  passengerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  distanceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  distanceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  distance: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2196F3',
  },
  arrivedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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
  startButton: {
    backgroundColor: '#2196F3',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
