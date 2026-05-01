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
  }, []);

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
    backgroundColor: '#0F172A', // Navy Slate background
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
    color: '#FFF',
    letterSpacing: 4,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  footer: {
    paddingBottom: 24, // Spacing from the bottom of the screen[cite: 18]
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B', // Muted slate color[cite: 18]
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  companyText: {
    color: '#94A3B8', // Slightly brighter highlight for the company name[cite: 18]
    fontWeight: '700',
  },
  inputSection: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#1E293B', // Slate input background
    color: '#FFF',
    padding: 18,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  passwordInput: {
    flex: 1,
    color: '#FFF',
    padding: 18,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  eyeIcon: {
    fontSize: 18,
  },
  button: {
    backgroundColor: '#3B82F6', // Azure Blue primary action[cite: 3]
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});