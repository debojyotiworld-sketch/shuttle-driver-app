import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import OTPScreen from '../screens/OTPScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={HomeScreen}
          options={{ title: 'Dashboard', headerBackVisible: false }}
        />
        <Stack.Screen 
          name="Rides"
          component={TripsScreen}
          options={{ title: 'Assigned Rides' }}
        />
        <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'Confirm Ride' }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Ride Map' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}