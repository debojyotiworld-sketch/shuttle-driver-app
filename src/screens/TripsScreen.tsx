import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, 
  Alert, Modal, TextInput 
} from 'react-native';
import { supabase } from '../utils/supabase';
import { startTripTracking, stopTripTracking } from '../utils/LocationService'; 
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import OTPVerificationModal from '../components/OTPVerificationModal';

// Interfaces
interface Trip {
  id: string;
  route_id: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledTime: string; // From related schedule
  routeName: string; // From related route
}

interface Booking {
  id: string;
  customer_id: string;
  pickup: string;
  drop: string;
  booking_code: string;
  status: string;
}

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Manifest Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Booking[]>([]);
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    // Real app e driver_id filter korben
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id, status, route_id,
        schedules ( departure_time ),
        routes ( name )
      `)
      .in('status', ['scheduled', 'in-progress'])
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching trips:', error);
    } else if (data) {
      const formattedTrips: Trip[] = data.map((t: any) => ({
        id: t.id,
        route_id: t.route_id,
        status: t.status,
        scheduledTime: t.schedules?.departure_time || 'N/A',
        routeName: t.routes?.name || 'Unknown Route'
      }));
      setTrips(formattedTrips);
    }
    setLoading(false);
  };

  // --- ACTION HANDLERS ---

  const handleStartTrip = async (tripId: string) => {
    try {
      // 1. Update Supabase
      const { error } = await supabase
        .from('trips')
        .update({ status: 'in-progress', started_at: new Date().toISOString() })
        .eq('id', tripId);

      if (error) throw error;

      // 2. Start Background Location Tracking
      await startTripTracking();
      
      Alert.alert('Success', 'Trip started. Location is being tracked.');
      fetchTrips(); // Refresh list
    } catch (e) {
      Alert.alert('Error', 'Failed to start trip.');
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    try {
      // 1. Update Supabase
      const { error } = await supabase
        .from('trips')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', tripId);

      if (error) throw error;

      // 2. Stop Background Location Tracking
      await stopTripTracking();
      
      Alert.alert('Success', 'Trip completed.');
      fetchTrips(); 
    } catch (e) {
      Alert.alert('Error', 'Failed to complete trip.');
    }
  };

  const handleCancelTrip = (tripId: string) => {
    Alert.prompt(
      'Cancel Trip',
      'Please enter reason for cancellation:',
      [
        { text: 'Back', style: 'cancel' },
        { 
          text: 'Confirm Cancel', 
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason) return;
            await supabase
              .from('trips')
              .update({ 
                status: 'cancelled', 
                cancel_reason: reason,
                cancel_requested_at: new Date().toISOString()
              })
              .eq('id', tripId);
            fetchTrips();
          }
        }
      ]
    );
  };

  // --- MANIFEST & OTP LOGIC ---

  const openManifest = async (tripId: string) => {
    setSelectedTripId(tripId);
    setModalVisible(true);
    
    // Fetch bookings for this trip
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('trip_id', tripId); // Assuming you link booking to trip

    if (data) setPassengers(data);
  };

  const verifyOTP = async (bookingId: string) => {
    // Basic OTP Check logic. Apni database er sathe melate paren.
    if (otpInput.length === 5) {
      // Supabase e status update: 'in-transit' ba 'boarded'
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'in-transit' })
        .eq('id', bookingId);
        
      if (!error) {
        Alert.alert('Verified', 'Passenger boarded successfully.');
        setOtpInput('');
        openManifest(selectedTripId!); // Refresh list
      }
    } else {
      Alert.alert('Invalid OTP', 'Please enter a valid 5-digit OTP.');
    }
  };

  // --- RENDERERS ---

  const renderTripCard = ({ item }: { item: Trip }) => {
    const isStarted = item.status === 'in-progress';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.timeText}>{item.scheduledTime}</Text>
          <View style={[styles.statusBadge, isStarted ? styles.bgActive : styles.bgScheduled]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.routeText}>{item.routeName}</Text>
        
        <TouchableOpacity style={styles.manifestBtn} onPress={() => openManifest(item.id)}>
          <Ionicons name="people-outline" size={20} color="#007AFF" />
          <Text style={styles.manifestBtnText}>View Passenger Manifest</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          {!isStarted ? (
            <TouchableOpacity style={[styles.btn, styles.btnStart]} onPress={() => handleStartTrip(item.id)}>
              <Text style={styles.btnText}>Start Trip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btn, styles.btnComplete]} onPress={() => handleCompleteTrip(item.id)}>
              <Text style={styles.btnText}>Complete Trip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => handleCancelTrip(item.id)}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Assigned Trips</Text>
      
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripCard}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchTrips}
        ListEmptyComponent={<Text style={styles.emptyText}>No assigned trips found.</Text>}
      />
      <OTPVerificationModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        passengers={passengers} 
        onVerify={(bookingId, inputOtp, actualPnr) => {
            // Ekhane apnar aager verifyOTP er bhitorer logic thakbe
            if (inputOtp.length === 5 && inputOtp === actualPnr) {
               // supabase update etc..
            }
        }} 
      />
      {/* Manifest Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Passenger Manifest</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={passengers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.passengerCard}>
                <Text style={styles.paxCode}>Booking: {item.booking_code}</Text>
                <Text style={styles.paxRoute}>{item.pickup} ➔ {item.drop}</Text>
                <Text style={styles.paxStatus}>Status: {item.status}</Text>
                
                {item.status === 'confirmed' && (
                  <View style={styles.otpRow}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="Enter OTP"
                      keyboardType="number-pad"
                      maxLength={5}
                      value={otpInput}
                      onChangeText={setOtpInput}
                    />
                    <TouchableOpacity style={styles.verifyBtn} onPress={() => verifyOTP(item.id)}>
                      <Text style={styles.verifyBtnText}>Verify</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' }, // Pure Black Background
  pageTitle: { fontSize: 24, fontWeight: '900', padding: 20, color: '#FFD700', letterSpacing: 1 }, // Yellow Title
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888888', fontSize: 16, fontWeight: '600' },
  
  card: { 
    backgroundColor: '#111111', // Dark grey/black card
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#333333',
    elevation: 4, 
    shadowColor: '#FFD700', 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 2 } 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  timeText: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' }, // White time
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  bgScheduled: { backgroundColor: '#FFD700' }, // Yellow Badge for Scheduled
  bgActive: { backgroundColor: '#00E676' }, // Green Badge for In-Progress
  statusText: { color: '#000000', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 }, // Black text on badge
  routeText: { fontSize: 16, color: '#AAAAAA', marginBottom: 20, fontWeight: '600' },
  
  manifestBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#000000', 
    padding: 14, 
    borderRadius: 12, 
    justifyContent: 'center', 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700' // Yellow outline
  },
  manifestBtnText: { color: '#FFD700', fontWeight: '800', marginLeft: 8, fontSize: 15 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnStart: { backgroundColor: '#FFD700' }, // Yellow Start Button
  btnComplete: { backgroundColor: '#00E676' }, // Green Complete Button
  btnCancel: { backgroundColor: '#222222', borderWidth: 1, borderColor: '#EF4444' }, // Dark button with Red border for Cancel
  btnText: { color: '#000000', fontWeight: '900', fontSize: 16 }, // Black text for Start/Complete
  btnTextCancel: { color: '#EF4444', fontWeight: '900', fontSize: 16 }, // Red text for Cancel

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#000000' },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderColor: '#333333', 
    backgroundColor: '#111111' 
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#FFD700' },
  
  passengerCard: { 
    backgroundColor: '#111111', 
    padding: 20, 
    marginHorizontal: 15, 
    marginTop: 15, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#333333' 
  },
  paxCode: { fontWeight: '900', fontSize: 18, marginBottom: 8, color: '#FFFFFF', letterSpacing: 1 },
  paxRoute: { color: '#AAAAAA', marginBottom: 8, fontSize: 15, fontWeight: '600' },
  paxStatus: { color: '#FFD700', fontStyle: 'italic', marginBottom: 15, fontWeight: '700' },
  
  otpRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  otpInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#FFD700', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    fontSize: 20, 
    backgroundColor: '#000000', // Pure black input field
    color: '#FFFFFF', // White OTP text
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8 // Spaced out for OTP feel
  },
  verifyBtn: { backgroundColor: '#FFD700', paddingHorizontal: 24, justifyContent: 'center', borderRadius: 12 },
  verifyBtnText: { color: '#000000', fontWeight: '900', fontSize: 16 }
});