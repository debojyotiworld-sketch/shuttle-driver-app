import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { supabase } from '../utils/supabase';

export default function AuthScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigation.replace('Dashboard');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigation.replace('Dashboard');
    });

    return () => listener.subscription.unsubscribe();
  }, [navigation]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Authentication Error', 'Credentials are required to access the system.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login Failed', error.message);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.formContainer}>

        {/* Logo Section matching the Pro-Tool branding */}
        <View style={styles.logoWrapper}>
          <Image
            source={{ uri: 'ic_launcher' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>RYDON</Text>
          <Text style={styles.brandSubtitle}>DRIVER PORTAL</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>OPERATOR EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="operator@rydon.com"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>{isPasswordVisible ? '👁️' : '🔒'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by <Text style={styles.companyText}>Unbroken Technologies</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure Black background
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700', // Yellow Branding
    letterSpacing: 4,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#AAAAAA', // Light slate/grey
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  footer: {
    paddingBottom: 24, // Spacing from the bottom of the screen
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888888', // Muted grey
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  companyText: {
    color: '#FFD700', // Yellow highlight for the company name
    fontWeight: '800',
  },
  inputSection: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    color: '#AAAAAA',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#111111', // Dark grey input background
    color: '#FFFFFF', // White text
    padding: 18,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    padding: 18,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  eyeIcon: {
    fontSize: 18,
    color: '#888888', // Muted eye icon
  },
  button: {
    backgroundColor: '#FFD700', // Taxi Yellow primary action
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#222222',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#000000', // Black text on yellow button
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});