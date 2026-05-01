import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { supabase } from '../utils/supabase';

export default function PassengerBoardingScreen({ route, navigation }: any) {
  const { tripId } = route.params || {}; // Logic check: ensuring tripId is present
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPassengers(); }, []);

  const fetchPassengers = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
        id,
        status,
        pickup,
        drop,
        customers (
          id,
          name,
          phone
        ),
        stops!bookings_pickup_stop_id_fkey (
          name,
          stop_order
        )
      `)
        .eq("trip_id", tripId)
        .in("status", ["confirmed", "in-transit" ])
        .order("stop_order", {
          foreignTable: "stops",
          ascending: true,
        });

      if (error) throw error;

      const formatted = (data || []).map((b: any) => ({
        booking_id: b.id,
        name: b.customers?.name || "Unknown",
        phone: b.customers?.phone || "",
        pickup_location: b.stops?.name || b.pickup || "N/A",
        drop_location: b.drop || "N/A",
        status: b.status,
      }));

      setPassengers(formatted);
    } catch (err) {
      console.error("Fetch passengers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderPassenger = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTag}>PASSENGER</Text>
          <Text style={styles.name}>{item.customers?.name || 'Authorized Guest'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'in-transit' ? '#2ECC71' : '#3B82F6' }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>ROUTING</Text>
        <Text style={styles.infoValue}>{item.pickup} → {item.drop}</Text>
      </View>

      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={() => navigation.navigate('OTP', { bookingId: item.id, passengerName: item.customers?.name })}
      >
        <Text style={styles.verifyBtnText}>VERIFY OTP</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerArea}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Boarding List</Text>
        <Text style={styles.screenSub}>Verify passengers for Trip #{tripId?.slice(0, 8)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={passengers}
          keyExtractor={(item) => item.id}
          renderItem={renderPassenger}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No passengers assigned to this trip.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  headerArea: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#1E293B' },
  screenTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  screenSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  listContent: { padding: 20, gap: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTag: { fontSize: 10, fontWeight: '800', color: '#3B82F6', letterSpacing: 1 },
  name: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  infoRow: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 16 },
  infoLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  verifyBtn: { backgroundColor: '#0F172A', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  verifyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  emptyText: { textAlign: 'center', marginTop: 100, color: '#94A3B8', fontSize: 14 }
});