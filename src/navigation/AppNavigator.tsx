import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import SupportScreen from '../screens/SupportScreen';
import PassengerBoardingScreen from '../screens/PassengerBoardingScreen';
import DriverProfileScreen from '../screens/DriverProfileScreen';

export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
  DriverProfile: undefined;
  Rides: undefined;
  Support: undefined;
  PassengerBoarding: undefined;
  ActiveRide: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Dashboard" component={HomeScreen} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="Rides" component={TripsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="PassengerBoarding" component={PassengerBoardingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}