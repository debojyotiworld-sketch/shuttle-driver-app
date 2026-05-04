import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDropdown from '../components/CustomDropdown';
import { supabase } from '../utils/supabase';

export interface SupportTicket {
  id: string;
  issueType: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  tripId?: string;
}

const ISSUE_TYPES = [
  { label: 'Trip Issue', value: 'trip' },
  { label: 'Payment Problem', value: 'payment' },
  { label: 'App Bug', value: 'bug' },
  { label: 'Other', value: 'other' },
];

export default function SupportScreen({ route }: any) {
  const { tripId, issueType: defaultIssue } = route.params || {};

  const [issueType, setIssueType] = useState(defaultIssue || '');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ issueType?: string; description?: string }>({});

  const [previousTickets, setPreviousTickets] = useState<SupportTicket[]>([]);

  // 🔥 VALIDATION
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!issueType) newErrors.issueType = 'Select an issue type';
    if (!description.trim() || description.length < 10)
      newErrors.description = 'Provide at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 SUBMIT TICKET (WITH TRIP ID)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { error } = await supabase.from('support_tickets').insert({
        issue_type: issueType,
        description,
        status: 'open',
        trip_id: tripId || null,
        user_email: user.email,
      });

      if (error) {
        console.log('SUPPORT ERROR:', error);
        Alert.alert('Error', 'Failed to submit ticket');
        return;
      }

      // local UI update
      const newTicket: SupportTicket = {
        id: Math.random().toString(36).substr(2, 9),
        issueType,
        description,
        status: 'open',
        createdAt: new Date().toISOString(),
        tripId,
      };

      setPreviousTickets([newTicket, ...previousTickets]);

      setShowSuccess(true);
      setIssueType('');
      setDescription('');

      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.headerArea}>
        <Text style={styles.screenTitle}>Support Center</Text>
        <Text style={styles.screenSub}>
          {tripId ? `Trip Support (ID: ${tripId})` : 'General Support'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* 🔥 EMERGENCY CARD */}
        <TouchableOpacity
          style={styles.emergencyCard}
          onPress={() =>
            Alert.alert('Emergency', 'Call support?', [
              { text: 'Cancel' },
              { text: 'Call', style: 'destructive' },
            ])
          }
        >
          <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
          <Text style={styles.emergencyDescription}>
            24/7 urgent trip support line
          </Text>
        </TouchableOpacity>

        {/* 🔥 FORM */}
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>REPORT ISSUE</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Issue Type</Text>
            <CustomDropdown
              options={ISSUE_TYPES}
              value={issueType}
              onValueChange={(val) => {
                setIssueType(val);
                setErrors({});
              }}
            />
            {errors.issueType && (
              <Text style={styles.errorText}>{errors.issueType}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Explain your issue..."
              placeholderTextColor="#64748B"
              multiline
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                setErrors({});
              }}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>SUBMIT TICKET</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* 🔥 SUCCESS MODAL */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successCheck}>✓</Text>
            <Text style={styles.successTitle}>Ticket Created</Text>
            <Text style={styles.successMsg}>
              We will review your request shortly.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },

  headerArea: { padding: 20, backgroundColor: '#1E293B' },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  screenSub: { fontSize: 13, color: '#94A3B8', marginTop: 4 },

  scrollContent: { padding: 20 },

  emergencyCard: {
    backgroundColor: '#7F1D1D',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  emergencyTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  emergencyDescription: { color: '#FCA5A5', fontSize: 12, marginTop: 4 },

  formCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
  },

  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 12,
  },

  inputGroup: { marginBottom: 16 },
  label: { color: '#94A3B8', marginBottom: 6 },

  textArea: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    height: 100,
  },

  submitBtn: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  submitBtnText: { color: '#fff', fontWeight: '800' },

  errorText: { color: '#EF4444', fontSize: 11 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  successBox: {
    backgroundColor: '#1E293B',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },

  successCheck: { fontSize: 40, color: '#22C55E' },
  successTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  successMsg: { color: '#94A3B8', textAlign: 'center', marginTop: 6 },
});