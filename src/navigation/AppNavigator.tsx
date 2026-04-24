import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import QRScreen from '../screens/QRScreen';
import TripsScreen from '../screens/TripsScreen';

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
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="QR" component={QRScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}