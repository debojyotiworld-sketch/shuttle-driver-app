import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import OTPScreen from '../screens/OTPScreen';
import SupportScreen from '../screens/SupportScreen';
import MapScreen from '../screens/MapScreen';
import PassengerBoardingScreen from '../screens/PassengerBoardingScreen';
import ActiveRideScreen from '../screens/ActiveRideScreen';

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
        <Stack.Screen 
          name="Support"
          component={SupportScreen}
          options={{ title: 'Support', headerShown: false }}
        />
        <Stack.Screen 
          name="Map"
          component={MapScreen as any}
          options={{ title: 'Live Trip Map', headerShown: false }}
        />
        <Stack.Screen 
          name="PassengerBoarding"
          component={PassengerBoardingScreen}
          options={{ title: 'Passenger Verification', headerShown: false }}
        />
        <Stack.Screen 
          name="ActiveRide"
          component={ActiveRideScreen}
          options={{ title: 'Active Ride', headerShown: false }}
        />
        <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'Confirm Ride' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}