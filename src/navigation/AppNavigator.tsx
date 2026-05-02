import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

// Import Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import SupportScreen from '../screens/SupportScreen';
import PassengerBoardingScreen from '../screens/PassengerBoardingScreen';
import ActiveRideScreen from '../screens/ActiveRideScreen';
import DriverProfileScreen from '../screens/DriverProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Auth"
        screenOptions={{ 
          headerShown: false, // Global removal of the nasty default headers
          animation: 'fade' 
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Dashboard" component={HomeScreen} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="Rides" component={TripsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="PassengerBoarding" component={PassengerBoardingScreen} />
        <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
}); */
