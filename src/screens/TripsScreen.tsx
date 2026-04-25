import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';

interface TripData {
  id: string;
  passenger: string;
  source: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  pickupAddress: string;
  dropoffAddress: string;
}

export default function TripsScreen({ navigation }: any) {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      // Fetch assigned trips from Supabase
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'assigned'); // Example status

      if (error) {
        console.error('Error fetching trips:', error);
        // Fallback or handle error. For now, use empty array or keep previous state.
        setTrips([]);
      } else if (data && data.length > 0) {
        setTrips(data as TripData[]);
      } else {
        // Mock data if no backend data is available for testing the UI
        setTrips([
          {
            id: '1',
            passenger: 'John Doe',
            source: { latitude: 37.78825, longitude: -122.4324 },
            destination: { latitude: 37.79825, longitude: -122.4424 },
            pickupAddress: '123 Main St',
            dropoffAddress: '456 Market St',
          },
          {
            id: '2',
            passenger: 'Jane Smith',
            source: { latitude: 37.77825, longitude: -122.4124 },
            destination: { latitude: 37.76825, longitude: -122.4224 },
            pickupAddress: '789 Mission St',
            dropoffAddress: '101 Howard St',
          },
        ]);
      }
    } catch (err) {
      console.error('Fetch trips error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: TripData }) => (
    <View style={styles.tripCard}>
      <Text style={styles.passengerName}>Passenger: {item.passenger}</Text>
      <Text style={styles.address}>From: {item.pickupAddress}</Text>
      <Text style={styles.address}>To: {item.dropoffAddress}</Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Map', { trip: item })}
      >
        <Text style={styles.buttonText}>Start Trip</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No assigned trips at the moment.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  startButton: {
    marginTop: 12,
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
