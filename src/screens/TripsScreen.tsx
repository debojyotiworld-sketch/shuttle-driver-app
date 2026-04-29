import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';

interface TripData {
  id: string;
  schedule_id: string;
  route_id: string;
  status: string;
  current_latitude: number | null;
  current_longitude: number | null;
  passenger_count: number;
  routes?: {
    name: string;
  };
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
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: TripData }) => (
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
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Assigned Trips</Text>
      {loading ? <ActivityIndicator size="large" color="#000" /> : 
        <FlatList data={trips} keyExtractor={(t) => t.id} renderItem={renderItem} contentContainerStyle={{ padding: 16 }} />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
