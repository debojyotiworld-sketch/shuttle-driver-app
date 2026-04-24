import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QRScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>QR Screen Mock</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
  },
});
