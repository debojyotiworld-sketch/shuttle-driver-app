import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';
import CustomDropdown from '../components/CustomDropdown';

// Interface and Mock API remain consistent with your logic
export interface SupportTicket {
  id: string;
  issueType: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}

const ISSUE_TYPES = [
  { label: 'Trip Issue', value: 'trip' },
  { label: 'Payment Problem', value: 'payment' },
  { label: 'App Bug', value: 'bug' },
  { label: 'Other', value: 'other' },
];

export default function SupportScreen({ navigation }: { navigation: any }) {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ issueType?: string; description?: string }>({});
  
  const [previousTickets, setPreviousTickets] = useState<SupportTicket[]>([
    { id: '1', issueType: 'trip', description: 'Driver unable to find pickup', status: 'resolved', createdAt: '2026-04-20T10:30:00Z' },
    { id: '2', issueType: 'payment', description: 'Payment not processed', status: 'in-progress', createdAt: '2026-04-23T14:15:00Z' },
  ]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!issueType) newErrors.issueType = 'Select an issue type';
    if (!description.trim() || description.length < 10) newErrors.description = 'Provide at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    // Simulated API call delay
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: Math.random().toString(36).substr(2, 9),
        issueType,
        description,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      setPreviousTickets([newTicket, ...previousTickets]);
      setShowSuccess(true);
      setIssueType('');
      setDescription('');
      setIsLoading(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Area matching Home & Trips */}
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>Support Center</Text>
        <Text style={styles.screenSub}>Report issues or get emergency help</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Emergency Utility - Redesigned as a critical card */}
        <TouchableOpacity 
          style={styles.emergencyCard}
          onPress={() => Alert.alert('Emergency Support', 'Call support now?', [{text: 'Cancel'}, {text: 'Call', style: 'destructive'}])}
        >
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyTag}>CRITICAL</Text>
            <Text style={styles.emergencyIcon}>⚠️</Text>
          </View>
          <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
          <Text style={styles.emergencyDescription}>Immediate 24/7 priority line for active trip incidents.</Text>
        </TouchableOpacity>

        {/* Report Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>REPORT AN ISSUE</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Issue Category</Text>
            <CustomDropdown
              options={ISSUE_TYPES}
              value={issueType}
              onValueChange={(val) => { setIssueType(val); setErrors({}); }}
            />
            {errors.issueType && <Text style={styles.errorText}>{errors.issueType}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Detailed Description</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Explain the situation..."
              placeholderTextColor="#64748B"
              multiline
              value={description}
              onChangeText={(txt) => { setDescription(txt); setErrors({}); }}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, isLoading && styles.btnDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>SUBMIT TICKET</Text>}
          </TouchableOpacity>
        </View>

        {/* Previous Tickets List */}
        <View style={styles.historySection}>
          <Text style={styles.sectionLabel}>TICKET HISTORY</Text>
          {previousTickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketItem}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketType}>{ticket.issueType.toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: ticket.status === 'resolved' ? '#2ECC71' : '#3B82F6' }]}>
                  <Text style={styles.statusText}>{ticket.status}</Text>
                </View>
              </View>
              <Text style={styles.ticketDesc} numberOfLines={2}>{ticket.description}</Text>
              <Text style={styles.ticketDate}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Success Modal matching Pro Theme */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successCheck}>✓</Text>
            <Text style={styles.successTitle}>Ticket Logged</Text>
            <Text style={styles.successMsg}>Support will review your request shortly.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  headerArea: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#1E293B' },
  screenTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  screenSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  scrollContent: { padding: 20 },
  
  // Emergency Card
  emergencyCard: { backgroundColor: '#7F1D1D', padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: '#B91C1C' },
  emergencyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  emergencyTag: { color: '#FECACA', fontSize: 10, fontWeight: '900' },
  emergencyIcon: { fontSize: 18 },
  emergencyTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  emergencyDescription: { color: '#FCA5A5', fontSize: 13, fontWeight: '500' },

  // Form
  formCard: { backgroundColor: '#1E293B', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#334155', marginBottom: 32 },
  sectionLabel: { color: '#64748B', fontSize: 11, fontWeight: '800', marginBottom: 16, letterSpacing: 1 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  textArea: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, color: '#FFF', fontSize: 15, height: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4, fontWeight: '600' },
  submitBtn: { backgroundColor: '#3B82F6', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: '#334155' },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 1 },

  // History
  historySection: { gap: 12 },
  ticketItem: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketType: { color: '#94A3B8', fontSize: 10, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  ticketDesc: { color: '#FFF', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  ticketDate: { color: '#64748B', fontSize: 11, fontWeight: '600' },

  // Success Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)', justifyContent: 'center', alignItems: 'center' },
  successBox: { backgroundColor: '#1E293B', padding: 40, borderRadius: 32, alignItems: 'center', borderWidth: 1, borderColor: '#334155', width: '80%' },
  successCheck: { fontSize: 48, color: '#2ECC71', marginBottom: 16 },
  successTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  successMsg: { color: '#94A3B8', fontSize: 14, textAlign: 'center' }
});