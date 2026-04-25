import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(false);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Logout Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Portal</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardTitle}>Your Status</Text>
          </View>

          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isOnline ? '#4CAF50' : '#FF5252' }
              ]} />
              <Text style={styles.statusLabel}>
                {isOnline ? 'Online & Available' : 'Offline'}
              </Text>
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>
                {isOnline ? 'Turn Off' : 'Go Online'}
              </Text>
              <Switch 
                value={isOnline} 
                onValueChange={setIsOnline}
                trackColor={{ false: '#e0e0e0', true: '#81c784' }}
                thumbColor={isOnline ? '#4CAF50' : '#ffffff'}
                style={styles.toggle}
              />
            </View>

            {isOnline && (
              <View style={styles.onlineInfo}>
                <Text style={styles.infoText}>✓ You're ready to accept rides</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>127</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Acceptance</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.ridesButton]}
            onPress={() => navigation.navigate('Rides')}
          >
            <Text style={styles.actionButtonText}>View Assigned Rides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.supportButton]}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.earningsButton]}
            onPress={() => {}}
          >
            <Text style={styles.actionButtonText}>View Earnings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  statusHeader: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggle: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  onlineInfo: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ridesButton: {
    backgroundColor: '#1a1a1a',
  },
  supportButton: {
    backgroundColor: '#2196F3',
  },
  earningsButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});