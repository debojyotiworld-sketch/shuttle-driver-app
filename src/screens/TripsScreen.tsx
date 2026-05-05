import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { useNavigation } from '@react-navigation/native';
import OtpModal from '../components/OtpModal';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

export default function TripsScreen() {
  const navigation = useNavigation<any>();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState<'today' | 'upcoming' | 'all'>('today');

  const [modalVisible, setModalVisible] = useState(false);
  const [passengers, setPassengers] = useState<any[]>([]);

  const [otpVisible, setOtpVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedTripStatus, setSelectedTripStatus] = useState('');
  const [otp, setOtp] = useState('');

  const [watchId, setWatchId] = useState<any>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  // ---------------- LOCATION TRACKING ----------------

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startLocationTracking = async (tripId: string) => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('Permission denied');
      return;
    }

    setActiveTripId(tripId);

    const id = Geolocation.watchPosition(
      async (position) => {
        try {
          const { latitude, longitude, speed } = position.coords;

          const safeSpeed =
            typeof speed === 'number' && !isNaN(speed) ? speed : 0;

          const { error } = await supabase
            .from('trip_locations')
            .insert({
              trip_id: tripId,
              latitude,
              longitude,
              speed_kmh: Number((safeSpeed * 3.6).toFixed(1)),
            });

          if (error) {
            console.log('Insert error:', error.message);
          }
        } catch (err) {
          console.log('Unexpected error:', err);
        }
      },
      (error) => {
        console.log('GPS error:', error.message);
      },
      {
        enableHighAccuracy: true,

        // 🔥 More practical values
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 10000,

        timeout: 15000,
        maximumAge: 10000,
      }
    );

    setWatchId(id);
  };
  const stopLocationTracking = async (tripId: string) => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setActiveTripId(null);

    await supabase
      .from('trips')
      .update({ status: 'completed' })
      .eq('id', tripId);

    fetchTrips();
  };
  // ---------------- PASSENGER COUNT ----------------

  const getPassengerCount = async (tripId: string) => {
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', tripId);

    return count || 0;
  };

  // ---------------- FETCH TRIPS ----------------

  const fetchTrips = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { data: driverData } = await supabase
      .from('drivers')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!driverData) return;

    const { data } = await supabase
      .from('trips')
      .select(`
        id,
        status,
        schedules (
          departure_time,
          schedule_date,
          routes (name)
        )
      `)
      .eq('driver_id', driverData.id);

    const enriched = await Promise.all(
      (data || []).map(async (t) => ({
        ...t,
        passengerCount: await getPassengerCount(t.id),
      }))
    );

    const sorted = enriched.sort((a, b) => {
      const dateA = new Date(a.schedules?.[0]?.schedule_date).getTime();
      const dateB = new Date(b.schedules?.[0]?.schedule_date).getTime();

      const timeA = a.schedules?.[0]?.departure_time || '';
      const timeB = b.schedules?.[0]?.departure_time || '';

      return dateA - dateB || timeA.localeCompare(timeB);
    });

    setTrips(sorted);
    setLoading(false);
  };

  // ---------------- STATUS UPDATE ----------------

  const updateTripStatus = async (tripId: string, status: string) => {
    if (activeTripId && activeTripId !== tripId) {
      Alert.alert('Finish current trip first');
      return;
    }

    // ✅ ONLY ONE UPDATE HERE
    const { error } = await supabase
      .from('trips')
      .update({ status })
      .eq('id', tripId);

    if (error) {
      Alert.alert(error.message);
      return;
    }

    if (status === 'in_progress') {
      await startLocationTracking(tripId);
    }

    if (status === 'completed' || status === 'cancelled') {
      await stopLocationTracking(tripId);
    }

    fetchTrips();
  };

  // ---------------- MANIFEST ----------------

  const openManifest = async (trip: any) => {
    const { data } = await supabase
      .from('bookings')
      .select(`id,pnr,booking_code,pickup,drop,status,customers(name)`)
      .eq('trip_id', trip.id);

    setSelectedTripStatus(trip.status);
    setPassengers(data || []);
    setModalVisible(true);
  };

  // ---------------- OTP ----------------

  const handlePassengerPress = (item: any) => {
    if (selectedTripStatus !== 'in_progress') {
      Alert.alert('Trip not started yet');
      return;
    }

    setSelectedBooking(item);
    setOtp('');
    setOtpVisible(true);
  };

  const verifyOtp = async () => {
    if (!selectedBooking) return;

    if (selectedBooking.pnr?.trim() === otp.trim()) {
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', selectedBooking.id);

      setOtpVisible(false);
      setSelectedBooking(null);
      fetchTrips();
    } else {
      Alert.alert('Invalid OTP');
    }
  };

  // ---------------- FILTER ----------------

  const getFilteredTrips = () => {
    const today = new Date().toISOString().slice(0, 10);

    return trips.filter((t) => {
      const date = t?.schedules?.[0]?.schedule_date?.slice(0, 10);
      return activeTab === 'all' || date === today;
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ---------------- UI ----------------

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <Text style={styles.headerSub}>
          Manage and track your assigned trips
        </Text>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        {['today', 'upcoming', 'all'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[
              styles.tabBtn,
              activeTab === tab && styles.activeTabBtn,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={getFilteredTrips()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const status = item.status?.toLowerCase();
          const isActive = activeTripId === item.id;
          const isDisabled = !!activeTripId && activeTripId !== item.id;

          return (
            <View
              style={[
                styles.card,
                isDisabled && styles.disabledCard,
                isActive && styles.activeCard,
              ]}
            >

              {/* TOP ROW */}
              <TouchableOpacity
                disabled={isDisabled}
                onPress={() => openManifest(item)}
              >
                <View style={styles.row}>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>
                      {item.schedules?.routes?.name}
                    </Text>

                    <Text style={styles.meta}>
                      🕒 {item.schedules?.departure_time}
                    </Text>

                    <Text style={styles.meta}>
                      📅 {item.schedules?.schedule_date?.slice(0, 10)}
                    </Text>

                    <Text style={styles.meta}>
                      Status: {status}
                    </Text>

                    {/* ACTIVE TAG */}
                    {isActive && (
                      <Text style={styles.activeBadge}>
                        ● ACTIVE TRIP
                      </Text>
                    )}
                  </View>

                  {/* PASSENGER COUNT */}
                  <View style={styles.passengerCapsule}>
                    <Text style={styles.passengerText}>
                      {item.passengerCount}
                    </Text>
                  </View>

                </View>
              </TouchableOpacity>

              {/* ACTION BUTTONS */}

              {status === 'scheduled' && (
                <TouchableOpacity
                  disabled={isDisabled}
                  style={[
                    styles.startBtn,
                    isDisabled && styles.disabledBtn,
                  ]}
                  onPress={() =>
                    updateTripStatus(item.id, 'in_progress')
                  }
                >
                  <Text style={styles.btnText}>Start Trip</Text>
                </TouchableOpacity>
              )}

              {status === 'in_progress' && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() =>
                    updateTripStatus(item.id, 'completed')
                  }
                >
                  <Text style={styles.btnText}>Complete Trip</Text>
                </TouchableOpacity>
              )}

              {status !== 'completed' &&
                status !== 'cancelled' && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() =>
                      navigation.navigate('Support', {
                        tripId: item.id,
                      })
                    }
                  >
                    <Text style={styles.btnText}>Cancel Trip</Text>
                  </TouchableOpacity>
                )}
            </View>
          );
        }}
      />

      {/* PASSENGER MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Passenger Manifest</Text>

          <FlatList
            data={passengers}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.passengerCard}
                onPress={() => handlePassengerPress(item)}
              >
                <Text style={styles.name}>
                  {item.customers?.name}
                </Text>
                <Text>
                  {item.pickup} → {item.drop}
                </Text>
                <Text style={styles.status}>
                  {item.status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: '#fff' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* OTP MODAL */}
      <OtpModal
        visible={otpVisible}
        otp={otp}
        setOtp={setOtp}
        onVerify={verifyOtp}
        onClose={() => setOtpVisible(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 🔥 HEADER
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  headerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  // 🔥 TABS (modern pill style)
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTabBtn: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 13,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // 🔥 CARD
  card: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },

  activeCard: {
    borderWidth: 2,
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF5',
  },

  disabledCard: {
    opacity: 0.4,
  },

  // 🔥 ROW
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 🔥 TEXT
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  activeBadge: {
    marginTop: 6,
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 12,
  },

  // 🔥 PASSENGER COUNT
  passengerCapsule: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  passengerText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 🔥 BUTTONS
  startBtn: {
    backgroundColor: '#16A34A',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  completeBtn: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  cancelBtn: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  disabledBtn: {
    backgroundColor: '#9CA3AF',
  },

  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },

  // 🔥 MODAL
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },

  passengerCard: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  status: {
    marginTop: 4,
    color: '#10B981',
  },

  closeBtn: {
    marginTop: 20,
    backgroundColor: '#111827',
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
  }
});