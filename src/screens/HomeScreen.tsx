import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar
} from 'react-native';
import { supabase } from '../utils/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Utility Bar with Integrated Actions */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandText}>RYDON</Text>
          <Text style={styles.systemStatus}>System: Active</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setIsOnline(!isOnline)}
            style={[
              styles.statusToggle, 
              { backgroundColor: isOnline ? '#00C853' : '#334155' }
            ]}
          >
            <View style={[styles.dot, { backgroundColor: isOnline ? '#FFF' : '#94A3B8' }]} />
            <Text style={styles.toggleText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
          </TouchableOpacity>

          {/* Quick Access Profile Trigger */}
          <TouchableOpacity 
            style={styles.menuTrigger} 
            onPress={() => setShowMenu(!showMenu)}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Overlay Menu (Replaces the nasty old header buttons) */}
      {showMenu && (
        <View style={styles.overlayMenu}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => { setShowMenu(false); navigation.navigate('DriverProfile'); }}
          >
            <Text style={styles.menuItemText}>👤 View Profile</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Performance Metrics Section */}
        <View style={styles.metricsWrapper}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>4.8</Text>
            <Text style={styles.metricLabel}>Rating</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>127</Text>
            <Text style={styles.metricLabel}>Trips</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>98%</Text>
            <Text style={styles.metricLabel}>Acceptance</Text>
          </View>
        </View>

        {/* Main Action Card */}
        <TouchableOpacity 
          activeOpacity={0.9}
          style={styles.mainTripCard}
          onPress={() => navigation.navigate('Rides')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTag}>ACTIVE ASSIGNMENTS</Text>
            <View style={styles.pulse} />
          </View>
          <Text style={styles.cardTitle}>View Assigned Rides</Text>
          <Text style={styles.cardDescription}>
            Manage your current transports queue and trip status.
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.footerLink}>OPEN TRIP SCREEN →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => navigation.navigate('Support')}
        >
          <Text style={styles.supportEmoji}>💬</Text>
          <Text style={styles.supportText}>Open Support Center</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#1E293B',
    zIndex: 10,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandText: { fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: 2 },
  systemStatus: { fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  statusToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  toggleText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  menuTrigger: { padding: 8, backgroundColor: '#334155', borderRadius: 12 },
  menuIcon: { fontSize: 16 },
  
  // Overlay Menu Styles
  overlayMenu: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: 180,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  menuItem: { padding: 16 },
  menuItemText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  menuDivider: { height: 1, backgroundColor: '#334155' },

  content: { padding: 20 },
  metricsWrapper: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 16, paddingVertical: 20, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  metricItem: { flex: 1, alignItems: 'center' },
  metricValue: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  metricLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginTop: 4 },
  divider: { width: 1, height: '100%', backgroundColor: '#334155' },
  mainTripCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTag: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1 },
  pulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  cardTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  cardDescription: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 20 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 16 },
  footerLink: { fontSize: 14, fontWeight: '700', color: '#3B82F6' },
  supportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#334155', gap: 12 },
  supportEmoji: { fontSize: 18 },
  supportText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});