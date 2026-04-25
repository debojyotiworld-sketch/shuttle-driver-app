import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';

interface PassengerBoardingProps {
  navigation: any;
  route: any;
}

export default function PassengerBoardingScreen({
  navigation,
  route,
}: PassengerBoardingProps) {
  const { trip, driverLocation } = route.params;

  const [otp, setOtp] = useState('');
  const [correctOtp] = useState('123456'); // Mock OTP - In production, get from backend
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(true);
  const [otpTimer, setOtpTimer] = useState(60);
  const [showSuccess, setShowSuccess] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (!otpSent && otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (otpTimer === 0) {
      setOtpSent(true);
      setOtpTimer(60);
    }
  }, [otpTimer, otpSent]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (otp === correctOtp) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // Navigate to active ride screen
          navigation.navigate('ActiveRide', {
            trip,
            driverLocation,
            passengerBoarded: true,
          });
        }, 2000);
      } else {
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
        setOtp('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpSent(false);
    setOtp('');
    
    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('OTP Sent', 'A new OTP has been sent to the passenger.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      setOtpSent(true);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            navigation.popToTop();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passenger Verification</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        {/* Passenger Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.passengerName}>{trip.passenger}</Text>
          <Text style={styles.pickupAddress}>{trip.pickupAddress}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Ready to Board</Text>
          </View>
        </View>

        {/* OTP Verification Section */}
        <View style={styles.otpSection}>
          <Text style={styles.sectionTitle}>Enter Passenger OTP</Text>
          <Text style={styles.description}>
            Ask the passenger to provide their 6-digit OTP code
          </Text>

          {/* OTP Input */}
          <TextInput
            style={[styles.otpInput, otp.length === 6 && styles.otpInputFilled]}
            placeholder="000000"
            value={otp}
            onChangeText={(text) => {
              // Only allow numbers and max 6 digits
              const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
              setOtp(numericText);
            }}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
            placeholderTextColor="#ccc"
          />

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.length !== 6 || isLoading) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP Option */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive OTP?</Text>
            <TouchableOpacity
              disabled={!otpSent}
              onPress={handleResendOTP}
            >
              <Text
                style={[
                  styles.resendLink,
                  !otpSent && styles.resendLinkDisabled,
                ]}
              >
                {otpSent ? 'Resend' : `Resend in ${otpTimer}s`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Pickup Location</Text>
            <Text style={styles.detailValue}>{trip.pickupAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🏁 Drop-off Location</Text>
            <Text style={styles.detailValue}>{trip.dropoffAddress}</Text>
          </View>
        </View>
      </View>

      {/* Cancel Button */}
      <View style={styles.footerButton}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Passenger Verified!</Text>
            <Text style={styles.successMessage}>
              {trip.passenger} has been confirmed. Starting the trip now...
            </Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  backButton: {
    width: 50,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  // Passenger Info Card
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 32,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  pickupAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },

  // OTP Section
  otpSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a1a',
    letterSpacing: 8,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  otpInputFilled: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  verifyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyButtonDisabled: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0.1,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  resendText: {
    fontSize: 13,
    color: '#666',
  },
  resendLink: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#999',
  },

  // Trip Details
  tripDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },

  // Footer
  footerButton: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  cancelButtonText: {
    color: '#FF5252',
    fontSize: 15,
    fontWeight: '700',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
