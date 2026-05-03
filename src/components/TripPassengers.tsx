import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';

export default function TripPassengers({ visible, onClose, tripId }: any) {
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  const fetchPassengers = React.useCallback(async () => {
    setLoading(true);
    try {
      // PassengerBoardingScreen এর মতো হুবহু query
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
          )
        `)
        .eq("trip_id", tripId)
        .in("status", ["confirmed", "in-transit", "pending", "confirmed", "booked"]);

      if (error) throw error;

      // BoardingScreen এর মতো Data Mapping logic[cite: 13]
      const formatted = (data || []).map((b: any) => ({
        id: b.id,
        name: b.customers?.name || "Authorized Guest",
        pickup_location: b.pickup || "N/A",
        drop_location: b.drop || "N/A",
        status: b.status,
      }));

      setPassengers(formatted);
    } catch (err) {
      console.error("Manifest fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (visible && tripId) fetchPassengers();
  }, [visible, tripId, fetchPassengers]);

  const renderItem = ({ item, index }: any) => (
    <View style={styles.row}>
      <View style={styles.rowLead}>
        <View style={styles.indexCircle}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.pName}>{item.name}</Text>
          <Text style={styles.pRoute}>{item.pickup_location} → {item.drop_location}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Trip Manifest</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#3B82F6" style={styles.loadingSpinner} />
          ) : (
            <FlatList
              data={passengers}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listPadding}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No bookings found for this trip.</Text>
                </View>
              }
            />
          )}
          
          <View style={styles.footerBranding}>
            <Text style={styles.footerText}>
              Powered by <Text style={styles.companyText}>Unbroken Technologies</Text>
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#1E293B', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  closeX: { color: '#94A3B8', fontSize: 24, fontWeight: '800' },
  listPadding: { paddingBottom: 20 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#0F172A', 
    borderRadius: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  rowLead: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  textContainer: { flex: 1 },
  indexCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  indexText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  pName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  pRoute: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  footerBranding: { marginTop: 10, paddingBottom: 10, alignItems: 'center' },
  footerText: { color: '#64748B', fontSize: 11, fontWeight: '500' },
  companyText: { color: '#94A3B8', fontWeight: '700' },
  loadingSpinner: { margin: 50 }
});