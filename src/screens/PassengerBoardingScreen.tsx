import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';

const PASSENGERS = [
  { id: '1', name: 'Shrestha Gupta', pickup: 'Sector V', status: 'Pending' },
  { id: '2', name: 'Rahul Sharma', pickup: 'New Town', status: 'Boarded' },
];

export default function PassengerBoardingScreen() {
  // In a real app, you would handle the state for each passenger
  
  const renderPassenger = ({ item }: any) => (
    <View style={styles.passengerCard}>
      <View>
        <Text style={styles.passengerName}>{item.name}</Text>
        <Text style={styles.pickupLocation}>Pickup: {item.pickup}</Text>
      </View>
      <TouchableOpacity 
        style={[
          styles.boardButton, 
          item.status === 'Boarded' && styles.boardedButton
        ]}
      >
        <Text style={[
          styles.boardButtonText,
          item.status === 'Boarded' && styles.boardedButtonText
        ]}>
          {item.status === 'Boarded' ? 'Boarded' : 'Check In'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Boarding</Text>
        <Text style={styles.headerSubtitle}>2 Passengers Total</Text>
      </View>

      <FlatList
        data={PASSENGERS}
        renderItem={renderPassenger}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startTripButton}>
          <Text style={styles.startTripText}>Start Trip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 24, gap: 16 },
  passengerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  passengerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  pickupLocation: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  boardButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  boardButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  boardedButton: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  boardedButtonText: { color: '#374151' },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  startTripButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startTripText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});