import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import OTPVerificationModal from '../components/OTPVerificationModal';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PassengerBoardingScreen({ route, navigation }: any) {
  const { tripId } = route.params || {};
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null);

  useEffect(() => { fetchPassengers(); }, []);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`id, status, pickup, drop, customers (id, name, phone)`)
        .eq("trip_id", tripId)
        .in("status", ["confirmed", "in-transit"]);

      if (error) throw error;
      setPassengers(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleVerifySuccess = async (bookingId: string) => {
    try {
      // 1. Update the booking status in Supabase[cite: 7, 13]
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'in-transit' })
        .eq('id', bookingId);

      if (error) throw error;

      // 2. Close the modal
      setSelectedPassenger(null);

      // 3. Refresh the list so the row turns green/shows "ON BOARD"[cite: 11, 13]
      fetchPassengers();

      // Logic: We DO NOT navigate to ActiveRide here
    } catch (err) {
      Alert.alert("Error", "Failed to update boarding status");
    }
  };

  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => setSelectedPassenger(item)}
      activeOpacity={0.7}
    >
      <View style={styles.rowLead}>
        <View style={styles.indexCircle}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.passengerName}>{item.customers?.name || 'Authorized Guest'}</Text>
          <Text style={styles.routeText}>{item.pickup} → {item.drop}</Text>
        </View>
      </View>

      <View style={styles.rowAction}>
        {/* Status Badge integrated into the row */}
        <View style={[styles.miniStatus, { backgroundColor: item.status === 'in-transit' ? '#10B981' : '#3B82F6' }]}>
          <Text style={styles.miniStatusText}>{item.status === 'in-transit' ? 'ON BOARD' : 'READY'}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>Boarding List</Text>
        <Text style={styles.screenSub}>Tap a passenger to verify OTP</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={passengers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedPassenger && (
        <OTPVerificationModal
          visible={!!selectedPassenger}
          passengerName={selectedPassenger.customers?.name}
          bookingId={selectedPassenger.id}
          onClose={() => setSelectedPassenger(null)}
          onVerify={handleVerifySuccess}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A' // Main dark background
  },
  headerArea: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  screenTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  screenSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 4 },

  listContainer: {
    padding: 16 // Added padding so rows don't touch edges
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B', // Slightly lighter than background to stand out[cite: 3]
    borderRadius: 16,
    marginBottom: 12, // Space between rows[cite: 13]
    borderWidth: 1,
    borderColor: '#334155' // Subtle border for definition
  },
  rowLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  textContainer: {
    flex: 1
  },
  indexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center'
  },
  indexText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  passengerName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  routeText: { color: '#94A3B8', fontSize: 12, marginTop: 2 },

  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  miniStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniStatusText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  chevron: {
    color: '#334155',
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: { height: 1, backgroundColor: '#1E293B', marginLeft: 68 }
});