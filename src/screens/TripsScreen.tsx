import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';

// Interface stays the same for data consistency
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

      // Logic: Bookings table theke count fetch korchi
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          routes (id, name),
          passenger_count:bookings(count) 
        `)
        .eq('driver_id', driver.id)
        .neq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Supabase count object return kore, tai amra map kore value-ta set korchi
      const formattedTrips = data.map(trip => ({
        ...trip,
        passenger_count: trip.passenger_count?.[0]?.count || 0
      }));

      setTrips(formattedTrips);
    } catch (err: any) {
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
        .update({ status: 'in-progress', started_at: new Date().toISOString() })
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
    const inProgress = item.status === 'in-progress';

    return (
      <View style={[styles.card, !canStart && styles.disabledCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.cardTag}>
              {inProgress ? 'ACTIVE NOW' : 'NEXT ASSIGNMENT'}
            </Text>
            <Text style={styles.routeName}>{item.routes?.name || 'Standard Route'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: inProgress ? '#2ECC71' : '#334155' }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Time Assigned</Text>
            <Text style={styles.infoValue}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Pax Count</Text>
            <Text style={styles.infoValue}>{item.passenger_count} People</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.actionBtn, inProgress ? styles.btnPrimary : styles.btnOutline, !canStart && styles.btnDisabled]}
          onPress={() => handleTripAction(item)}
          disabled={!canStart}
        >
          <Text style={[styles.btnText, !inProgress && { color: '#0F172A' }]}>
            {inProgress ? 'CONTINUE TRIP' : 'START TRIP'}
          </Text>
        </TouchableOpacity>

        {!canStart && (
          <Text style={styles.lockedText}>Locked until previous trips complete</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>My Trips</Text>
        <Text style={styles.screenSub}>Manage your trip queue</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>All caught up! No pending trips.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Matching Home Slate
  },
  headerArea: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#1E293B',
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  screenSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  disabledCard: {
    backgroundColor: '#F1F5F9',
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 1,
    marginBottom: 4,
  },
  routeName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#0F172A',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  btnDisabled: {
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  lockedText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
  },
});