import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '../utils/supabase';

export default function DriverProfileScreen({ navigation }: any) {
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDriverProfile(); }, []);

  const fetchDriverProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('drivers').select('*').eq('user_id', user.id).single();
        if (error) throw error;
        setDriver(data);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Auth');
  };

  if (loading) return <ActivityIndicator style={styles.centered} size="large" color="#3B82F6" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topUtility}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.imageBox}>
            {driver?.driver_photo ? (
              <Image source={{ uri: driver.driver_photo }} style={styles.photo} />
            ) : (
              <Text style={styles.initials}>{driver?.name?.charAt(0)}</Text>
            )}
          </View>
          <Text style={styles.name}>{driver?.name || 'Authorized Driver'}</Text>
          <View style={styles.statusChip}>
            <Text style={styles.statusText}>{driver?.status || 'Active'}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionLabel}>OPERATIONAL RECORDS</Text>
          <InfoBox label="LICENSE" value={driver?.license_number} />
          <InfoBox label="EXPERIENCE" value={`${driver?.experience_years} Years`} />
          <InfoBox label="CONTACT" value={driver?.phone} />
          <InfoBox label="TOTAL TRIPS" value={driver?.total_trips} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoBox = ({ label, value }: any) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  centered: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center' },
  topUtility: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#1E293B' },
  backText: { color: '#94A3B8', fontWeight: '800', fontSize: 12 },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 12 },
  scrollContent: { padding: 24 },
  profileHeader: { alignItems: 'center', marginBottom: 40 },
  imageBox: { width: 100, height: 100, borderRadius: 24, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  initials: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  name: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  statusChip: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  statsSection: { gap: 12 },
  sectionLabel: { color: '#64748B', fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  infoBox: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  infoLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  infoValue: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});