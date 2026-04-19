import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const MOCK_TRIPS = [
  {
    id: '1',
    passenger: 'John Doe',
    source: { latitude: 37.78825, longitude: -122.4324 },
    destination: { latitude: 37.79825, longitude: -122.4424 },
    pickupAddress: '123 Main St',
    dropoffAddress: '456 Market St',
  },
  {
    id: '2',
    passenger: 'Jane Smith',
    source: { latitude: 37.77825, longitude: -122.4124 },
    destination: { latitude: 37.76825, longitude: -122.4224 },
    pickupAddress: '789 Mission St',
    dropoffAddress: '101 Howard St',
  },
];

export default function TripsScreen({ navigation }: any) {
  const renderItem = ({ item }: { item: typeof MOCK_TRIPS[0] }) => (
    <View style={styles.tripCard}>
      <Text style={styles.passengerName}>Passenger: {item.passenger}</Text>
      <Text style={styles.address}>From: {item.pickupAddress}</Text>
      <Text style={styles.address}>To: {item.dropoffAddress}</Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Map', { trip: item })}
      >
        <Text style={styles.buttonText}>Start Trip</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_TRIPS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  startButton: {
    marginTop: 12,
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
