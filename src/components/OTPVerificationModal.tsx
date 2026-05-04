import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Booking {
  id: string;
  customer_id: string;
  pickup: string;
  drop: string;
  booking_code: string;
  status: string;
  pnr: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  passengers: Booking[];
  onVerify: (bookingId: string, inputOtp: string, actualPnr: string) => void;
}

export default function OTPVerificationModal({ visible, onClose, passengers, onVerify }: Props) {
  const [otpInput, setOtpInput] = useState('');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Passenger Manifest</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#FFD700" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={passengers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.passengerCard}>
              <Text style={styles.paxCode}>Booking: {item.booking_code}</Text>
              <Text style={styles.paxRoute}>{item.pickup} ➔ {item.drop}</Text>
              <Text style={styles.paxStatus}>Status: {item.status}</Text>

              {item.status === 'confirmed' && (
                <View style={styles.otpRow}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="Enter 5-digit PNR"
                    placeholderTextColor="#555"
                    keyboardType="number-pad"
                    maxLength={5}
                    value={otpInput}
                    onChangeText={setOtpInput}
                  />
                  <TouchableOpacity 
                    style={styles.verifyBtn} 
                    onPress={() => {
                        onVerify(item.id, otpInput, item.pnr);
                        setOtpInput(''); // Clear input after clicking verify
                    }}
                  >
                    <Text style={styles.verifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#000000' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#333333', backgroundColor: '#111111' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#FFD700' },
  passengerCard: { backgroundColor: '#111111', padding: 20, marginHorizontal: 15, marginTop: 15, borderRadius: 16, borderWidth: 1, borderColor: '#333333' },
  paxCode: { fontWeight: '900', fontSize: 18, marginBottom: 8, color: '#FFFFFF', letterSpacing: 1 },
  paxRoute: { color: '#AAAAAA', marginBottom: 8, fontSize: 15, fontWeight: '600' },
  paxStatus: { color: '#FFD700', fontStyle: 'italic', marginBottom: 15, fontWeight: '700' },
  otpRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  otpInput: { flex: 1, borderWidth: 1, borderColor: '#FFD700', borderRadius: 12, paddingHorizontal: 15, fontSize: 20, backgroundColor: '#000000', color: '#FFFFFF', fontWeight: '700', textAlign: 'center', letterSpacing: 8 },
  verifyBtn: { backgroundColor: '#FFD700', paddingHorizontal: 24, justifyContent: 'center', borderRadius: 12 },
  verifyBtnText: { color: '#000000', fontWeight: '900', fontSize: 16 }
});