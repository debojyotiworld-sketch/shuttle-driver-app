import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';

export default function DriverProfileScreen() {
  const [driver, setDriver] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const MenuItem = ({ title, value }: { title: string; value?: string }) => (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuTitle}>{title}</Text>
      {value ? (
        <Text style={styles.menuValue}>{value}</Text>
      ) : (
        <Text style={styles.arrow}>→</Text>
      )}
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    // 🔹 Get logged user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    // 🔹 Get driver
    const { data: driverData, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', user.email)
      .single();

    if (error || !driverData) {
      console.log('Driver fetch error:', error);
      setLoading(false);
      return;
    }

    setDriver(driverData);

    // 🔹 Get vehicle (IMPORTANT: adjust field name if needed)
    if (driverData.vehicle_id) {
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', driverData.vehicle_id)
        .single();

      setVehicle(vehicleData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 🔥 HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driver?.name?.[0] || 'D'}
            </Text>
          </View>

          <Text style={styles.name}>{driver?.name || 'Driver'}</Text>

          <Text style={styles.vehicle}>
            {vehicle
              ? `${vehicle.registration_number} • ${vehicle.type}`
              : 'No vehicle assigned'}
          </Text>
        </View>

        {/* 🔥 ACCOUNT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.menuGroup}>
            <MenuItem title="Personal Info" />
            <MenuItem title="Phone" value={driver?.phone} />
            <MenuItem title="Email" value={driver?.email} />
          </View>
        </View>

        {/* 🔥 VEHICLE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle</Text>

          <View style={styles.menuGroup}>
            <MenuItem title="Number" value={vehicle?.registration_number} />
            <MenuItem title="Type" value={vehicle?.type} />
            <MenuItem title="Capacity" value={vehicle?.capacity?.toString()} />
            <MenuItem title="Status" value={vehicle?.status} />
          </View>
        </View>

        {/* 🔥 LOGOUT */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={async () => {
            await supabase.auth.signOut();
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#e3e614' },

  container: { padding: 20 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 🔥 HEADER
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  vehicle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  // 🔥 SECTION
  section: { marginBottom: 24 },

  sectionTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    textTransform: 'uppercase',
  },

  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },

  menuItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  menuTitle: { fontSize: 14, color: '#374151' },

  menuValue: { fontSize: 13, color: '#6B7280' },

  arrow: { color: '#9CA3AF' },

  // 🔥 LOGOUT
  logoutCard: {
    marginTop: 10,
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
  },
});