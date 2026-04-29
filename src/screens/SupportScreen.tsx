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
} from 'react-native';
import CustomDropdown from '../components/CustomDropdown';
import { AlertCircle } from 'lucide-react-native';

export interface SupportTicket {
  id: string;
  issueType: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}

interface SupportScreenProps {
  navigation: any;
}

const ISSUE_TYPES = [
  { label: 'Trip Issue', value: 'trip' },
  { label: 'Payment Problem', value: 'payment' },
  { label: 'App Bug', value: 'bug' },
  { label: 'Other', value: 'other' },
];

// API Integration Function
export const submitSupportTicket = async (
  issueType: string,
  description: string
): Promise<SupportTicket> => {
  try {
    const response = await fetch('https://api.example.com/support-ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_AUTH_TOKEN', // Replace with actual token
      },
      body: JSON.stringify({
        issueType,
        description,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SupportTicket = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to submit support ticket: ${error}`);
  }
};

export default function SupportScreen({ navigation }: SupportScreenProps) {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ issueType?: string; description?: string }>({});
  const [previousTickets, setPreviousTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      issueType: 'trip',
      description: 'Driver was unable to find pickup location',
      status: 'resolved',
      createdAt: '2026-04-20T10:30:00Z',
    },
    {
      id: '2',
      issueType: 'payment',
      description: 'Payment not processed for trip',
      status: 'in-progress',
      createdAt: '2026-04-23T14:15:00Z',
    },
  ]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!issueType) {
      newErrors.issueType = 'Please select an issue type';
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe your issue';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const ticket = await submitSupportTicket(issueType, description);

      // Add new ticket to list
      setPreviousTickets([
        {
          ...ticket,
          status: 'open',
        },
        ...previousTickets,
      ]);

      setShowSuccess(true);
      setIssueType('');
      setDescription('');

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit support ticket. Please try again.');
      console.error('Support ticket error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitSupportTicket = async (type: string, desc: string) => {
    // Simulate API call delay
    return new Promise<SupportTicket>((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          issueType: type,
          description: desc,
          status: 'open',
          createdAt: new Date().toISOString(),
        });
      }, 1500);
    });
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency Support',
      'We are connecting you with our 24/7 support team. Do you want to proceed?',
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        {
          text: 'Call Support',
          onPress: () => {
            submitSupportTicket('emergency', 'Driver has initiated an emergency support request');
            // Here you would integrate with the phone's dialer or support chat system
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getIssueTypeLabel = (type: string) => {
    const found = ISSUE_TYPES.find((item) => item.value === type);
    return found ? found.label : type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      case 'open':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Center</Text>
        <View style={{ width: 24 }} /> {/* Match the icon size for perfect centering */}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergency}
        >
          <AlertCircle style={styles.emergencyIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Emergency Support</Text>
            <Text style={styles.emergencySubtitle}>
              Get immediate help from our support team
            </Text>
          </View>
          <Text style={styles.emergencyArrow}>→</Text>
        </TouchableOpacity>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Report an Issue</Text>

          {/* Issue Type Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Issue Type <Text style={styles.required}>*</Text>
            </Text>
            <CustomDropdown
              options={ISSUE_TYPES.slice(1)}
              value={issueType}
              onValueChange={(value) => {
                setIssueType(value);
                setErrors({ ...errors, issueType: undefined });
              }}
              error={!!errors.issueType}
            />
            {errors.issueType && (
              <Text style={styles.errorText}>{errors.issueType}</Text>
            )}
          </View>

          {/* Description Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, errors.description && styles.inputError]}
              placeholder="Please describe your issue in detail..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setErrors({ ...errors, description: undefined });
              }}
              editable={!isLoading}
            />
            <Text style={styles.characterCount}>
              {description.length} / 500
            </Text>
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Ticket</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Previous Tickets Section */}
        {previousTickets.length > 0 && (
          <View style={styles.ticketsSection}>
            <Text style={styles.sectionTitle}>Your Previous Tickets</Text>

            {previousTickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <View>
                    <Text style={styles.ticketType}>
                      {getIssueTypeLabel(ticket.issueType)}
                    </Text>
                    <Text style={styles.ticketDate}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{ticket.status}</Text>
                  </View>
                </View>
                <Text style={styles.ticketDescription}>{ticket.description}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Ticket Submitted</Text>
            <Text style={styles.successMessage}>
              Our support team will review your ticket shortly and get back to you.
            </Text>
            <Text style={styles.ticketReference}>
              Check your previous tickets below for status updates.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 10,
  },
  backButton: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 30,
  },

  // Emergency Button
  emergencyButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5252',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#D32F2F',
  },
  emergencyArrow: {
    fontSize: 20,
    color: '#FF5252',
    marginLeft: 8,
  },

  // Form Section
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF5252',
  },

  // Text Input
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF5252',
    backgroundColor: '#FFEBEE',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },

  // Error Text
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Previous Tickets Section
  ticketsSection: {
    marginBottom: 20,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  ticketDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ticketDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 16,
    color: '#4CAF50',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketReference: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  iconContainer: {
    padding: 4,
  }
});
