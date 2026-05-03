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
              isOnline ? styles.bgOnline : styles.bgOffline
            ]}
          >
            <View style={[styles.dot, isOnline ? styles.bgDark : styles.bgLight]} />
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
            <Text style={[styles.menuItemText, styles.textError]}>🚪 Logout</Text>
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
  container: { flex: 1, backgroundColor: '#000000' }, // Pure Black Background
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#111111', // Slightly lighter black
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandText: { fontSize: 20, fontWeight: '900', color: '#FFD700', letterSpacing: 2 }, // Yellow Branding
  systemStatus: { fontSize: 10, color: '#888888', fontWeight: '700', textTransform: 'uppercase' },
  statusToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  toggleText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  menuTrigger: { padding: 8, backgroundColor: '#222222', borderRadius: 12 },
  menuIcon: { fontSize: 16 },
  
  // Overlay Menu Styles
  overlayMenu: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#111111',
    borderRadius: 16,
    width: 180,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#FFD700', // Yellow border for menu
    elevation: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  menuItem: { padding: 16 },
  menuItemText: { color: '#FFD700', fontWeight: '700', fontSize: 14 }, // Yellow menu text
  bgOnline: { backgroundColor: '#00E676' }, // Keep green for active/online status
  bgOffline: { backgroundColor: '#333333' },
  bgDark: { backgroundColor: '#000000' },
  bgLight: { backgroundColor: '#FFD700' },
  menuDivider: { height: 1, backgroundColor: '#222222' },

  content: { padding: 20 },
  metricsWrapper: { 
    flexDirection: 'row', 
    backgroundColor: '#111111', 
    borderRadius: 16, 
    paddingVertical: 20, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: '#333333' 
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricValue: { color: '#FFD700', fontSize: 22, fontWeight: '900' }, // Yellow metrics
  metricLabel: { color: '#888888', fontSize: 11, fontWeight: '600', marginTop: 4 },
  divider: { width: 1, height: '100%', backgroundColor: '#333333' },

  // Solid Yellow Trip Card with Black Text
  mainTripCard: { backgroundColor: '#FFD700', borderRadius: 24, padding: 24, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTag: { fontSize: 11, fontWeight: '900', color: '#222222', letterSpacing: 1 },
  pulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#000000' }, // Black pulse
  cardTitle: { fontSize: 24, fontWeight: '900', color: '#000000', marginBottom: 8 },
  cardDescription: { fontSize: 15, color: '#222222', lineHeight: 22, marginBottom: 20, fontWeight: '600' },
  cardFooter: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 16 },
  footerLink: { fontSize: 14, fontWeight: '900', color: '#000000' }, // Bold black action link

  supportButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#111111', 
    padding: 18, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#FFD700', // Yellow outline
    gap: 12 
  },
  supportEmoji: { fontSize: 18 },
  supportText: { color: '#FFD700', fontSize: 16, fontWeight: '800' },
  textError: { color: '#EF4444' }
});