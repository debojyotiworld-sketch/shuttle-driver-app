import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Dashboard</Text>

      <View style={styles.row}>
        <Text style={styles.status}>
          Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
        </Text>
        <Switch value={isOnline} onValueChange={setIsOnline} />
      </View>

      <TouchableOpacity
        style={styles.ridesButton}
        onPress={() => navigation.navigate('Rides')}
      >
        <Text style={styles.buttonText}>
          View Assigned Rides
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ridesButton}
        onPress={() => navigation.navigate('Map')}
      >
        <Text style={styles.buttonText}>
          View Map
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
  ridesButton: {
    marginTop: 40,
    width: '80%',
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