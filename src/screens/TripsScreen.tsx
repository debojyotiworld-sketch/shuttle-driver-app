import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
<<<<<<< HEAD
=======
import { SafeAreaView } from 'react-native-safe-area-context';
>>>>>>> 0196576 (Major update: Initial commit)
import { supabase } from '../utils/supabase';

interface TripData {
  id: string;
<<<<<<< HEAD
  passenger: string;
  source: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  pickupAddress: string;
  dropoffAddress: string;
=======
  schedule_id: string;
  route_id: string;
  status: string;
  current_latitude: number | null;
  current_longitude: number | null;
  passenger_count: number;
  routes?: {
    name: string;
  };
>>>>>>> 0196576 (Major update: Initial commit)
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
<<<<<<< HEAD
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
=======
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          routes ( name )
        `)
        .neq('status', 'completed');

      if (error) throw error;
      setTrips(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
>>>>>>> 0196576 (Major update: Initial commit)
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: TripData }) => (
<<<<<<< HEAD
    <View style={styles.tripCard}>
      <Text style={styles.passengerName}>Passenger: {item.passenger}</Text>
      <Text style={styles.address}>From: {item.pickupAddress}</Text>
      <Text style={styles.address}>To: {item.dropoffAddress}</Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Map', { trip: item })}
      >
        <Text style={styles.buttonText}>Start Trip</Text>
=======
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.routeName}>🚍 {item.routes?.name || 'Unknown Route'}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{item.status}</Text></View>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Passengers: <Text style={styles.infoValue}>{item.passenger_count}</Text></Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('PassengerBoarding', { trip: item })}
      >
        <Text style={styles.btnText}>Start Trip & View Stops</Text>
>>>>>>> 0196576 (Major update: Initial commit)
      </TouchableOpacity>
    </View>
  );

<<<<<<< HEAD
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
=======
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Assigned Trips</Text>
      {loading ? <ActivityIndicator size="large" color="#000" /> : 
        <FlatList data={trips} keyExtractor={(t) => t.id} renderItem={renderItem} contentContainerStyle={{ padding: 16 }} />
      }
    </SafeAreaView>
>>>>>>> 0196576 (Major update: Initial commit)
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', padding: 20, color: '#1A1A1A' },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  routeName: { fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: '#E3F2FD', padding: 5, borderRadius: 5 },
  badgeText: { color: '#2196F3', fontSize: 10, fontWeight: 'bold' },
  infoRow: { marginBottom: 15 },
  infoLabel: { color: '#666', fontSize: 14 },
  infoValue: { color: '#333', fontWeight: 'bold' },
  btn: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});
>>>>>>> 0196576 (Major update: Initial commit)
