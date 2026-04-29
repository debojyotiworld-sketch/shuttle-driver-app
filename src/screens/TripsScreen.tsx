import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';

interface TripData {
  id: string;
  route_id: string;
  driver_id: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  passenger_count: number;
  created_at: string;
  routes?: {
    name: string;
  };
}

export default function TripsScreen({ navigation }: any) {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError) throw driverError;

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          routes (
            id,
            name,
            stops (*),
            schedules (
              id,
              departure_time,
              bookings (*)
            )
          )
        `)
        .eq('driver_id', driver.id)
        .neq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (err: any) {
      console.error('Fetch error:', err.message);
      Alert.alert('Error', 'Could not fetch trips');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTripAction = async (trip: TripData) => {
    if (trip.status === 'scheduled') {
      const { error } = await supabase
        .from('trips')
        .update({
          status: 'in-progress',
          started_at: new Date().toISOString()
        })
        .eq('id', trip.id);

      if (error) {
        Alert.alert('Error', 'Failed to start trip');
        return;
      }
    }

    navigation.navigate('PassengerBoarding', { tripId: trip.id });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, []);

  const renderItem = ({ item, index }: { item: TripData; index: number }) => {
    const isAnyTripInProgress = trips.some(t => t.status === 'in-progress');
    const canStart = item.status === 'in-progress' || (!isAnyTripInProgress && index === 0);

    return (
      <View style={[styles.card, !canStart && styles.disabledCard]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.routeName}>🚍 {item.routes?.name || 'Route Name'}</Text>
            <Text style={styles.timeText}>Assigned: {new Date(item.created_at).toLocaleTimeString()}</Text>
          </View>
          <View style={[
            styles.badge,
            { backgroundColor: item.status === 'in-progress' ? '#E8F5E9' : '#E3F2FD' }
          ]}>
            <Text style={[
              styles.badgeText,
              { color: item.status === 'in-progress' ? '#2E7D32' : '#1976D2' }
            ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Passengers: <Text style={styles.infoValue}>{item.passenger_count}</Text></Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, !canStart && styles.disabledBtn]}
          onPress={() => handleTripAction(item)}
          disabled={!canStart}
        >
          <Text style={styles.btnText}>
            {item.status === 'in-progress' ? 'Continue Trip' : 'Start Trip'}
          </Text>
        </TouchableOpacity>

        {!canStart && !isAnyTripInProgress && index > 0 && (
          <Text style={styles.helperText}>Complete previous trips to unlock</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#1A1A1A" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No active or scheduled trips found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  disabledCard: { opacity: 0.6, elevation: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  routeName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  timeText: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  infoRow: { marginBottom: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  infoLabel: { color: '#666', fontSize: 14 },
  infoValue: { color: '#1A1A1A', fontWeight: 'bold' },
  btn: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#CCC' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  helperText: { textAlign: 'center', color: '#999', fontSize: 11, marginTop: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});