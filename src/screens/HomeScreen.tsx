import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

export default function HomeScreen() {
  const [driverName, setDriverName] = useState('');
  const navigation = useNavigation() as NavProp;

  useEffect(() => {
    getDriver();
  }, []);

  const getDriver = async () => {
    const { data: userData } = await supabase.auth.getUser();

    const user = userData?.user;

    if (!user) return;

    const { data, error } = await supabase
      .from('drivers')
      .select('name')
      .eq('email', user.email)
      .single();

    if (data) {
      setDriverName(data.name);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome</Text>
          <Text style={styles.driverName}>
            {driverName || 'Driver'}
          </Text>
        </View>

        {/* STATUS */}
        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>You are currently ONLINE</Text>
        </View>

        <View style={styles.quickMenu}>

          {/* PROFILE BUTTON */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('DriverProfile')}
          >
            <Text style={styles.menuTitle}>My Profile</Text>
            <Text style={styles.menuSub}>View & manage account</Text>
          </TouchableOpacity>

        </View>

        {/* EXISTING CONTENT */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryCard}
            onPress={() => navigation.navigate('Rides')}
          >
            <Text style={styles.cardTitle}>View Trips</Text>
            <Text style={styles.cardSubtitle}>
              See all assigned trips
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity style={[styles.secondaryCard, { marginRight: 8 }]}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Trips Today</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryCard, { marginLeft: 8 }]}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 24,
  },
  quickMenu: {
    marginBottom: 24,
    gap: 12,
  },

  menuCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  menuSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  driverName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981', // Emerald green for online status
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionContainer: {
    gap: 16,
  },
  primaryCard: {
    backgroundColor: '#111827',
    padding: 24,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});