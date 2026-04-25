import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface TripData {
  id: string;
  passenger: string;
  source: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
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
  const [rideStarted, setRideStarted] = useState(false);

  const handleStartTrip = () => {
    setRideStarted(true);
    Alert.alert('Trip Started', 'Heading to passenger pickup location.');
  };

  const handleArriveAtPassenger = () => {
    navigation.navigate('PassengerBoarding', {
      trip,
      driverLocation: trip.source, // Passing source as placeholder driver location since we removed maps
    });
  };

  const handleEndTrip = () => {
    Alert.alert('End Trip', 'Are you sure you want to end this trip?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'End Trip',
        onPress: () => {
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ride Status</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            {!rideStarted ? 'Ready to Start Trip' : 'En Route to Passenger'}
          </Text>

          <View style={styles.tripDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Passenger</Text>
              <Text style={styles.detailValue}>{trip.passenger}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup</Text>
              <Text style={styles.detailValue}>{trip.pickupAddress}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Drop-off</Text>
              <Text style={styles.detailValue}>{trip.dropoffAddress}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!rideStarted ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={handleStartTrip}
          >
            <Text style={styles.buttonText}>Start Trip</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.nextButton]}
              onPress={handleArriveAtPassenger}
            >
              <Text style={styles.buttonText}>Arrived at Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleEndTrip}
            >
              <Text style={styles.buttonText}>Cancel Trip</Text>
            </TouchableOpacity>
          </>
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
  header: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  tripDetails: {
    gap: 16,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  actionButton: {
    paddingVertical: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});
