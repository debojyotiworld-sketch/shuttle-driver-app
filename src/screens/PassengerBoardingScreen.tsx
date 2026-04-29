import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { supabase } from '../utils/supabase';

export default function PassengerBoardingScreen({ route }: any) {
  const { trip } = route.params || {};
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      if (!trip?.route_id) return;

      setLoading(true);

      const { data: schedules, error: schError } = await supabase
        .from('schedules')
        .select('id')
        .eq('route_id', trip.route_id)
        .eq('driver_id', trip.driver_id);

      if (schError) throw schError;

      if (!schedules || schedules.length === 0) {
        setPassengers([]);
        return;
      }

      const scheduleIds = schedules.map(s => s.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          pickup,
          drop,
          customers (
            id,
            name,
            phone,
            email
          )
        `)
        .in('schedule_id', scheduleIds)
        .in('status', ['confirmed', 'in-transit']); // filter optional

      if (error) throw error;

      setPassengers(data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPassenger = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {item.customers?.name || 'No Name'}
      </Text>

      <Text style={styles.phone}>
        📞 {item.customers?.phone}
      </Text>

      <Text style={styles.route}>
        {item.pickup} → {item.drop}
      </Text>

      <Text style={[
        styles.status,
        { color: item.status === 'confirmed' ? 'green' : 'orange' }
      ]}>
        {item.status.toUpperCase()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Passenger List</Text>

      <FlatList
        data={passengers}
        keyExtractor={(item) => item.id}
        renderItem={renderPassenger}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No passengers found</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16
  },

  card: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  phone: {
    marginTop: 4,
    color: '#555'
  },

  route: {
    marginTop: 4,
    color: '#777'
  },

  status: {
    marginTop: 6,
    fontWeight: 'bold'
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999'
  }
});