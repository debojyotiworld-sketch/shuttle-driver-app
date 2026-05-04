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

  useEffect(() => {
    fetchTrips();
  }, []);

  // 🔥 COUNT
  const getPassengerCount = async (tripId: string) => {
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', tripId);

    return count || 0;
  };

  // 🔥 FETCH TRIPS
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

    setTrips(enriched);
    setLoading(false);
  };

  // 🔥 FILTER
  const getFilteredTrips = () => {
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'today') {
      return trips.filter(
        (t) => t?.schedules?.[0]?.schedule_date === today
      );
    }

    if (activeTab === 'upcoming') {
      return trips.filter(
        (t) =>
          t?.schedules?.[0]?.schedule_date > today &&
          t.status === 'scheduled'
      );
    }

    return trips;
  };

  // 🔥 OPEN MANIFEST
  const openManifest = async (trip: any) => {
    const { data } = await supabase
      .from('bookings')
      .select(`booking_code,pickup,drop,status,customers(name)`)
      .eq('trip_id', trip.id);

    setSelectedTripStatus(trip.status);
    setPassengers(data || []);
    setModalVisible(true);
  };

  // 🔥 UPDATE STATUS
  const updateTripStatus = async (tripId: string, status: string) => {
    await supabase.from('trips').update({ status }).eq('id', tripId);
    fetchTrips();
  };

  // 🔥 PASSENGER CLICK → OTP
  const handlePassengerPress = (item: any) => {
    if (selectedTripStatus !== 'in_progress') {
      Alert.alert('Trip not started yet');
      return;
    }

    setSelectedBooking(item);
    setOtp('');
    setOtpVisible(true);
  };

  // 🔥 VERIFY OTP
  const verifyOtp = async () => {
    if (!selectedBooking) return;

    const { data, error } = await supabase
      .from('bookings')
      .select('pnr')
      .eq('id', selectedBooking.id)
      .single();

    if (error) return;

    if (data?.pnr?.toString() === otp.toString()) {
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* TABS */}
      <View style={styles.tabContainer}>
        {['today', 'upcoming', 'all'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)}>
            <Text style={activeTab === tab ? styles.activeTab : styles.tab}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={getFilteredTrips()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = item.status?.toLowerCase();

          return (
            <View style={styles.card}>

              {/* CARD */}
              <TouchableOpacity
                onPress={() => openManifest(item)}
              >
                <View style={styles.row}>
                  <View>
                    <Text style={styles.title}>
                      {item.schedules?.routes?.name}
                    </Text>
                    <Text style={styles.meta}>
                      {item.schedules?.departure_time}
                    </Text>
                    <Text style={styles.meta}>
                      Status: {status}
                    </Text>
                  </View>

                  <View style={styles.passengerCapsule}>
                    <Text style={styles.passengerText}>
                      {item.passengerCount}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* ACTIONS */}
              {status === 'scheduled' && (
                <TouchableOpacity
                  style={styles.startBtn}
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
                        issueType: 'trip',
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
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tab: { fontSize: 14, color: '#6B7280', padding: 6 },
  activeTab: {
    fontSize: 14,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderColor: '#111827',
    padding: 6,
  },
  startBtn: {
    backgroundColor: '#16A34A',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  completeBtn: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  cancelBtn: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  card: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  passengerCapsule: {
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  passengerText: { color: '#fff', fontWeight: '700' },

  modalContainer: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 16 },

  passengerCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: { fontSize: 16, fontWeight: '600' },
  status: { marginTop: 4, color: '#10B981' },

  closeBtn: {
    marginTop: 20,
    backgroundColor: '#111827',
    padding: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
});