import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';

export default function ActiveRideScreen({ navigation, route }: any) {
  // Fix: Safe destructuring with fallback to prevent 'undefined' crashes
  const { trip } = route.params || {};

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={{color: '#FFF'}}>Error: No Trip Data Found</Text>
      </View>
    );
  }

  const handleCompleteRide = () => {
    Alert.alert('Complete Ride', 'Confirm passenger drop-off?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Drop-off',
        onPress: () => {
          navigation.popToTop();
          Alert.alert('Success', 'Trip logged as completed.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>Active Trip</Text>
        <Text style={styles.screenSub}>Monitoring passenger safety</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTag}>ON BOARD</Text>
              <Text style={styles.passengerName}>{trip.passenger}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>CURRENT DESTINATION</Text>
            <Text style={styles.infoValue}>{trip.dropoffAddress}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>ORIGIN</Text>
            <Text style={styles.infoValue}>{trip.pickupAddress}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.completeBtn} 
          onPress={handleCompleteRide}
        >
          <Text style={styles.btnText}>COMPLETE TRIP</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  headerArea: { paddingHorizontal: 24, paddingVertical: 24, backgroundColor: '#1E293B' },
  screenTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  screenSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  statusCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  cardTag: { fontSize: 10, fontWeight: '800', color: '#3B82F6', letterSpacing: 1 },
  passengerName: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, height: 28 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#10B981' },
  infoBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, marginBottom: 12 },
  infoLabel: { fontSize: 10, color: '#64748B', fontWeight: '800', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  completeBtn: { backgroundColor: '#10B981', height: 64, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
  btnText: { color: '#FFF', fontWeight: '800', letterSpacing: 1, fontSize: 15 }
});