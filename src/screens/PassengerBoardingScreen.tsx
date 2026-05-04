import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  StatusBar, 
  Alert 
} from 'react-native';
import { supabase } from '../utils/supabase';
import OTPVerificationModal from '../components/OTPVerificationModal';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PassengerBoardingScreen({ route, navigation }: any) {
  const { tripId } = route.params || {};
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null);


  const fetchPassengers = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id, 
          status, 
          pickup, 
          drop, 
          customers (id, name, phone)
        `)
        .eq("trip_id", tripId)
        .in("status", ["confirmed", "in-transit", "pending", "booked"]);

      if (error) throw error;
      setPassengers(data || []);
    } catch {
      Alert.alert("Sync Error", "Could not load the passenger manifest.");
    } finally { 
      setLoading(false); 
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) {
      fetchPassengers();
    } else {
      Alert.alert("Error", "No Trip ID provided.");
      navigation.goBack();
    }
  }, [tripId, navigation, fetchPassengers]);

  const handleVerifySuccess = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'in-transit' })
        .eq('id', bookingId);

      if (error) throw error;

      setSelectedPassenger(null);
      fetchPassengers(); // Refresh list to update status UI[cite: 13]

    } catch {
      Alert.alert("Error", "Failed to update boarding status.");
    }
  };

  const renderItem = ({ item, index }: any) => {
    // Logic: Check if the passenger is already on board[cite: 13]
    const isBoarded = item.status === 'in-transit';

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={isBoarded ? 1 : 0.7} // Visual feedback disabled if boarded[cite: 13]
        onPress={() => {
          if (isBoarded) {
            // Prevent second verification[cite: 13]
            Alert.alert("Action Restricted", `${item.customers?.name} is already verified and on board.`);
          } else {
            setSelectedPassenger(item);
          }
        }}
      >
        <View style={styles.rowLead}>
          <View style={styles.indexCircle}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.passengerName}>
              {item.customers?.name || 'Authorized Guest'}
            </Text>
            <Text style={styles.routeText}>{item.pickup} → {item.drop}</Text>
          </View>
        </View>

        <View style={styles.rowAction}>
          <View style={[
            styles.miniStatus, 
            isBoarded ? styles.miniStatusBoarded : styles.miniStatusReady
          ]}>
            <Text style={styles.miniStatusText}>
              {isBoarded ? 'ON BOARD' : 'READY'}
            </Text>
          </View>
          {!isBoarded && <Text style={styles.chevron}>›</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerArea}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Boarding List</Text>
        <Text style={styles.screenSub}>Tap a passenger to verify OTP</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={styles.emptyContainerSpaced} />
      ) : (
        <FlatList
          data={passengers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No passengers found.</Text>
            </View>
          }
        />
      )}

      {/* Logic: Only show modal for passengers who are NOT yet boarded[cite: 13] */}
      {selectedPassenger && selectedPassenger.status !== 'in-transit' && (
        <OTPVerificationModal
          visible={!!selectedPassenger}
          passengerName={selectedPassenger.customers?.name}
          bookingId={selectedPassenger.id}
          onClose={() => setSelectedPassenger(null)}
          onVerify={handleVerifySuccess}
        />
      )}

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
  headerArea: { 
    paddingHorizontal: 24, 
    paddingVertical: 24, 
    backgroundColor: '#1E293B', 
    borderBottomWidth: 1, 
    borderColor: '#334155' 
  },
  backText: { color: '#94A3B8', fontWeight: '800', fontSize: 12, marginBottom: 8 },
  screenTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  screenSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  listContainer: { padding: 16 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
  },
  rowLead: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  textContainer: { flex: 1 },
  indexCircle: { 
    width: 32, 
    height: 32, 
  },
  indexText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  passengerName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  routeText: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  rowAction: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  miniStatusText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  chevron: { color: '#334155', fontSize: 20, fontWeight: 'bold' },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  miniStatusBoarded: { backgroundColor: '#10B981' },
  miniStatusReady: { backgroundColor: '#3B82F6' },
  emptyContainerSpaced: { marginTop: 50 },
  emptyText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  footerBranding: { paddingBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  companyText: { color: '#94A3B8', fontWeight: '700' }
});