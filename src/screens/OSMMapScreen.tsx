import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { UrlTile, Marker, Polyline, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface TripData {
  id: string;
  passenger: string;
  source: LocationCoords;
  destination: LocationCoords;
  pickupAddress?: string;
  dropoffAddress?: string;
}

interface OSMMapScreenProps {
  route: {
    params: {
      trip: TripData;
    };
  };
  navigation: any;
}

const OSMMapScreen: React.FC<OSMMapScreenProps> = ({ route, navigation }) => {
  const { trip } = route.params;
  const mapRef = useRef<MapView>(null);

  const [driverLocation, setDriverLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth radius in km
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

  // Request location permission and get current location
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        setIsLoading(true);
        setError(null);

        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setDriverLocation({ latitude, longitude });

            // Animate map to current location
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

            // Check if already at pickup location
            const distance = calculateDistance(
              latitude,
              longitude,
              trip.source.latitude,
              trip.source.longitude
            );

            if (distance < 0.05) {
              Alert.alert(
                'Arrived!',
                'You have arrived at the pickup location'
              );
            }

            setIsLoading(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setError('Failed to get current location');
            setIsLoading(false);
            Alert.alert(
              'Location Error',
              'Please enable location services and try again'
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } catch (err) {
        console.error('Permission error:', err);
        setError('Permission denied');
        setIsLoading(false);
      }
    };

    requestLocationPermission();

    // Watch position for real-time updates
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDriverLocation({ latitude, longitude });

        // Check proximity to pickup (50m)
        const distance = calculateDistance(
          latitude,
          longitude,
          trip.source.latitude,
          trip.source.longitude
        );

        if (distance < 0.05) {
          Alert.alert(
            'Pickup Location',
            'You are close to the pickup location!'
          );
        }
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [trip.source]);

  const handleZoomIn = () => {
    if (mapRef.current && driverLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && driverLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        500
      );
    }
  };

  const handleContinue = () => {
    if (!driverLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    navigation.navigate('PassengerBoarding', {
      trip,
      driverLocation,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (error || !driverLocation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Location unavailable'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setError(null);
          }}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const distance = calculateDistance(
    driverLocation.latitude,
    driverLocation.longitude,
    trip.source.latitude,
    trip.source.longitude
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>
        {/* OpenStreetMap Tile Layer */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* Driver Marker - Blue */}
        <Marker
          coordinate={driverLocation}
          title="Your Location"
          description="Current driver position"
          pinColor="#2196F3"
        />

        {/* Pickup Marker - Red */}
        <Marker
          coordinate={trip.source}
          title="Pickup Location"
          description={trip.pickupAddress || 'Passenger pickup point'}
          pinColor="#FF5252"
        />

        {/* Destination Marker - Green */}
        <Marker
          coordinate={trip.destination}
          title="Destination"
          description={trip.dropoffAddress || 'Drop-off point'}
          pinColor="#4CAF50"
        />

        {/* Route Polyline - Driver to Pickup */}
        <Polyline
          coordinates={[driverLocation, trip.source]}
          strokeColor="#2196F3"
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />

        {/* Route Polyline - Pickup to Destination */}
        <Polyline
          coordinates={[trip.source, trip.destination]}
          strokeColor="#666"
          strokeWidth={2}
        />
      </MapView>

      {/* Zoom Controls */}
      <View style={styles.zoomContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Trip Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.tripHeader}>
          <Text style={styles.passengerName}>{trip.passenger}</Text>
          <Text style={styles.tripId}>Trip {trip.id}</Text>
        </View>

        <View style={styles.locationSection}>
          <View style={styles.locationItem}>
            <View style={[styles.locationDot, { backgroundColor: '#FF5252' }]} />
            <Text style={styles.locationText}>
              {trip.pickupAddress || 'Pickup Point'}
            </Text>
          </View>
          <View style={styles.distanceRow}>
            <Text style={styles.distanceLabel}>Distance:</Text>
            <Text style={styles.distance}>{distance.toFixed(2)} km</Text>
          </View>
          <View style={styles.locationItem}>
            <View style={[styles.locationDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.locationText}>
              {trip.dropoffAddress || 'Destination'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel Trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  zoomContainer: {
    position: 'absolute',
    bottom: 150,
    right: 16,
    gap: 8,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tripId: {
    fontSize: 14,
    color: '#999',
  },
  locationSection: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginVertical: 6,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#999',
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  continueButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OSMMapScreen;
