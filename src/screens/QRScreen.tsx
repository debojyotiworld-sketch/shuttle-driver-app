import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRScreen() {
  const rideId = "RIDE12345"; // later from backend

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Show this QR to Passenger</Text>

      <QRCode
        value={rideId}
        size={220}
      />

      <Text style={styles.rideId}>Ride ID: {rideId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  rideId: {
    marginTop: 20,
    fontSize: 16,
  },
});