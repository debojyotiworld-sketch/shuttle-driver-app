import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';

export default function DriverProfileScreen() {
  const MenuItem = ({ title, value }: { title: string, value?: string }) => (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuTitle}>{title}</Text>
      {value ? <Text style={styles.menuValue}>{value}</Text> : <Text style={styles.arrow}>→</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>D</Text>
          </View>
          <Text style={styles.name}>Debojyoti</Text>
          <Text style={styles.vehicle}>WB 02 AB 1234 • Shuttle Van</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGroup}>
            <MenuItem title="Personal Info" />
            <MenuItem title="Vehicle Documents" />
            <MenuItem title="Payout Methods" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuGroup}>
            <MenuItem title="Language" value="English" />
            <MenuItem title="Navigation App" value="Google Maps" />
          </View>
        </View>

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
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  logoutCard: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  avatarText: { fontSize: 32, color: '#FFFFFF', fontWeight: '600' },
  name: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  vehicle: { fontSize: 14, color: '#6B7280' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  menuGroup: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  menuTitle: { fontSize: 16, color: '#374151' },
  menuValue: { fontSize: 14, color: '#6B7280' },
  arrow: { color: '#9CA3AF', fontSize: 18 },
  logoutButton: { padding: 16, alignItems: 'center', marginTop: 16 },

  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  }
});