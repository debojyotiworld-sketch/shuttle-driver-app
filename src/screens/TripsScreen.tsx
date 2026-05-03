import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';
import { activateKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';
import { supabase } from '../utils/supabase';
import TripPassengers from '../components/TripPassengers';

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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');

  // Using ReturnType to avoid NodeJS namespace errors in React Native
  const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTrips = async () => {
    try {
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
          routes (id, name),
          bookings(*) 
        `)
        .eq('driver_id', driver.id)
        .in('status', ['scheduled', 'in-progress'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedTrips = (data || []).map(trip => ({
        ...trip,
        passenger_count: trip.bookings?.length || 0
      }));

      setTrips(formattedTrips);
    } catch {
      Alert.alert('System Error', 'Unable to sync trip queue.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    return () => stopTracking(); // Cleanup on unmount[cite: 1]
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        return (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (_err) {
        console.error('Permission Request Error:', _err);
        return false;
      }
    }
    return false;
  };


    const startTracking = async (tripId: string) => {
    activateKeepAwake();
    stopTracking(); // clear existing

    try {
      trackingInterval.current = Geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, speed } = position.coords;

          try {
            const { error } = await supabase
              .from('trip_locations')
              .insert({
                trip_id: tripId,
                latitude,
                longitude,
                speed_kmh: (speed || 0) * 3.6,
                recorded_at: new Date().toISOString()
              });

            if (error) console.error('Database Sync Error:', error.message);
          } catch {
            console.error('Location sync failed');
          }
        },
        (_error) => {
          // ignore error
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 5000,
          fastestInterval: 2000
        }
      ) as any;
    } catch { // ignore
      console.error('Failed to start location watch');
    }
  };

  const stopTracking = () => {
    deactivateKeepAwake();
    if (trackingInterval.current !== null) {
      Geolocation.clearWatch(trackingInterval.current as any);
      trackingInterval.current = null;
    }
  };

  const handleTripAction = async (trip: TripData) => {
    if (trip.status === 'scheduled') {
      // 1. Check permissions BEFORE starting the trip to prevent crashes[cite: 1]
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Cannot start trip without location access.");
        return;
      }

      // 2. Update status in Supabase[cite: 1]
      const { error } = await supabase
        .from('trips')
        .update({ status: 'in-progress', started_at: new Date().toISOString() })
        .eq('id', trip.id);

      if (error) {
        Alert.alert('Error', 'Failed to initialize trip.');
        return;
      }

      startTracking(trip.id); // Trigger interval tracking[cite: 1]
      fetchTrips();
      navigation.navigate('PassengerBoarding', { tripId: trip.id });

    } else if (trip.status === 'in-progress') {
      Alert.alert('Finish Journey', 'Are you sure you want to mark this trip as completed?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            const { error } = await supabase
              .from('trips')
              .update({ status: 'completed', ended_at: new Date().toISOString() })
              .eq('id', trip.id);

            if (error) {
              Alert.alert('Error', 'Failed to complete trip.');
            } else {
              stopTracking(); // Kill the timer on completion[cite: 1]
              fetchTrips();
              Alert.alert('Success', 'Trip logged as completed.');
            }
          }
        }
      ]);
    }
  };

  const handleCancelTrip = (tripId: string) => {
    Alert.alert('Cancel Assignment', 'Are you sure you want to cancel this trip?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('trips')
            .update({ status: 'cancelled' })
            .eq('id', tripId);
          if (error) {
            Alert.alert('Error', 'Failed to cancel.');
          } else {
            stopTracking(); // Kill timer on cancellation[cite: 1]
            fetchTrips();
            navigation.navigate('Support');
          }
        }
      }
    ]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, []);

  const renderItem = ({ item, index }: { item: TripData; index: number }) => {
    const isAnyTripInProgress = trips.some(t => t.status === 'in-progress');
    const canInteract = item.status === 'in-progress' || (!isAnyTripInProgress && index === 0);
    const inProgress = item.status === 'in-progress';

    return (
      <View style={[styles.card, !canInteract && styles.disabledCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.cardTag}>{inProgress ? 'ACTIVE NOW' : 'NEXT ASSIGNMENT'}</Text>
            <Text style={styles.routeName}>{item.routes?.name || 'Standard Route'}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <TouchableOpacity onPress={() => setSelectedTripId(item.id)} style={styles.viewBtn}>
              <Text style={styles.viewText}>MANIFEST</Text>
            </TouchableOpacity>
            <View style={[styles.statusBadge, inProgress ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Time Assigned</Text>
            <Text style={styles.infoValue}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Pax Count</Text>
            <Text style={styles.infoValue}>{item.passenger_count} People</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.actionBtn,
              styles.flexBtn,
              inProgress ? styles.btnActive : styles.btnOutline,
              !canInteract && styles.btnDisabled
            ]}
            onPress={() => handleTripAction(item)}
            disabled={!canInteract}
          >
            <Text style={[styles.btnText, !inProgress && styles.btnTextDark]}>
              {inProgress ? 'COMPLETE TRIP' : 'START TRIP'}
            </Text>
          </TouchableOpacity>

          {canInteract && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => handleCancelTrip(item.id)}
            >
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };


  const filteredTrips = trips.filter(trip => {
    const isCompleted = trip.status === 'completed' || trip.status === 'cancelled';
    if (activeTab === 'completed') return isCompleted;

    // Not completed logic
    if (isCompleted) return false;

    // Let's assume today means created_at is today
    const tripDate = new Date(trip.created_at);
    const today = new Date();
    const isToday = tripDate.toDateString() === today.toDateString();

    if (activeTab === 'today') return isToday;
    if (activeTab === 'upcoming') return !isToday && tripDate > today;

    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>My Trips</Text>
        <Text style={styles.screenSub}>Manage your logistical queue</Text>
      </View>


      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'today' && styles.tabBtnActive]} onPress={() => setActiveTab('today')}>
          <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]} onPress={() => setActiveTab('upcoming')}>
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]} onPress={() => setActiveTab('completed')}>
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTrips}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>All caught up! No pending trips.</Text>
          </View>
        }
      />

      <TripPassengers
        visible={!!selectedTripId}
        tripId={selectedTripId}
        onClose={() => setSelectedTripId(null)}
      />

      <View style={styles.footerBranding}>
        <Text style={styles.footerText}>
          Powered by <Text style={styles.companyText}>Unbroken Technologies</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  headerArea: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#1E293B' },
  screenTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  screenSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 2 },

  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#E0E0E0' },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, backgroundColor: '#F4F6F8' },
  tabBtnActive: { backgroundColor: '#009688' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#666666' },
  tabTextActive: { color: '#FFFFFF' },
  listContent: { padding: 20, gap: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
  disabledCard: { backgroundColor: '#F1F5F9', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardHeaderRight: { alignItems: 'flex-end', gap: 8 },
  statusBadgeActive: { backgroundColor: '#2ECC71' },
  statusBadgeInactive: { backgroundColor: '#E0E0E0' },
  btnActive: { backgroundColor: '#10B981' },
  btnTextDark: { color: '#333333' },
  headerLeft: { flex: 1 },
  cardTag: { fontSize: 10, fontWeight: '800', color: '#3B82F6', letterSpacing: 1, marginBottom: 4 },
  routeName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  viewBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F1F5F9', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  viewText: { fontSize: 10, fontWeight: '900', color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  infoGrid: { flexDirection: 'row', marginBottom: 24, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  buttonGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  flexBtn: { flex: 2 },
  cancelBtn: { flex: 1, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  cancelBtnText: { color: '#EF4444', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#0F172A' },
  btnDisabled: { borderColor: '#CBD5E1', backgroundColor: '#E2E8F0' },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },
  footerBranding: { paddingBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  companyText: { color: '#94A3B8', fontWeight: '700' }
});