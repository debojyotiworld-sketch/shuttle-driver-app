import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';

interface OTPProps {
  visible: boolean;
  onClose: () => void;
  passengerName: string;
  bookingId: string;
  onVerify: (bookingId: string) => void;
}

export default function OTPVerificationModal({ visible, onClose, passengerName, bookingId, onVerify }: OTPProps) {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onVerify(bookingId);
      setOtp('');
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Confirm Boarding</Text>
          <Text style={styles.subtitle}>Enter 4-digit OTP for {passengerName}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="0000"
            placeholderTextColor="#64748B"
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity 
            style={[styles.btn, otp.length < 4 && styles.btnDisabled]} 
            onPress={handleVerify}
            disabled={otp.length < 4 || verifying}
          >
            {verifying ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>VERIFY & BOARD</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#1E293B', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#94A3B8', fontSize: 14, marginBottom: 32 },
  input: { width: '100%', fontSize: 36, color: '#FFF', fontWeight: '800', textAlign: 'center', letterSpacing: 8, marginBottom: 32, backgroundColor: '#0F172A', borderRadius: 16, padding: 16 },
  btn: { backgroundColor: '#3B82F6', width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { backgroundColor: '#334155', opacity: 0.5 },
  btnText: { color: '#FFF', fontWeight: '800', letterSpacing: 1 },
  cancelBtn: { marginTop: 20 },
  cancelText: { color: '#94A3B8', fontWeight: '700', fontSize: 12 }
});