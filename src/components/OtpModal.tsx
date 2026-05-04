import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function OtpModal({
  visible,
  otp,
  setOtp,
  onVerify,
  onClose,
}: any) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>

          <Text style={styles.title}>Enter OTP</Text>

          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={5}
            style={styles.input}
            placeholder="5 digit OTP"
          />

          <TouchableOpacity style={styles.btn} onPress={onVerify}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Verify
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={{ marginTop: 10, color: 'red' }}>
              Cancel
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
});
