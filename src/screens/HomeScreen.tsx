import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Status</Text>

      <View style={styles.row}>
        <Text style={styles.status}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </Text>
        <Switch value={isOnline} onValueChange={setIsOnline} />
      </View>

      <Text style={styles.info}>
        Waiting for ride requests...
      </Text>

      <TouchableOpacity
        style={styles.bottomButton}
        onPress={() => navigation.navigate('QR')}
      >
        <Text style={styles.buttonText}>
          Start Ride (Show QR)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  status: {
    fontSize: 18,
  },
  info: {
    marginTop: 30,
    fontSize: 16,
    color: 'gray',
  },

  bottomButton: {
    position: 'absolute',
    bottom: 30,
    width: '90%',
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});