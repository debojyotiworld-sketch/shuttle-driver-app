import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout({ title, children }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Global Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    padding: 20,
    backgroundColor: '#1E293B'
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800'
  },
  content: {
    flex: 1,
    padding: 16
  }
});