import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../utils/supabase';

export default function DriverProfileScreen() {
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      // Get the currently logged-in user's ID from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setDriver(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.centered} size="large" color="#2196F3" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.imagePlaceholder}>
           {driver?.driver_photo ? (
             <Image source={{ uri: driver.driver_photo }} style={styles.profilePic} />
           ) : (
             <Text style={styles.initials}>{driver?.name?.charAt(0)}</Text>
           )}
        </View>
        <Text style={styles.name}>{driver?.name}</Text>
        <Text style={styles.status}>{driver?.status?.toUpperCase()}</Text>
      </View>

      <View style={styles.infoSection}>
        <InfoRow label="Phone" value={driver?.phone} />
        <InfoRow label="Email" value={driver?.email} />
        <InfoRow label="License" value={driver?.license_number} />
        <InfoRow label="Experience" value={`${driver?.experience_years} Years`} />
        <InfoRow label="Rating" value={`${driver?.rating}`} />
        <InfoRow label="Total Trips" value={driver?.total_trips} />
      </View>
    </ScrollView>
  );
}

const InfoRow = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || 'Not Provided'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#00796B', padding: 40, alignItems: 'center' },
  imagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#009688', justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden' },
  profilePic: { width: 100, height: 100 },
  initials: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  name: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  status: { color: '#009688', fontSize: 14, marginTop: 5, fontWeight: 'bold' },
  infoSection: { padding: 20 },
  row: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', elevation: 2 },
  label: { color: '#666', fontWeight: 'bold' },
  value: { color: '#333' }
});