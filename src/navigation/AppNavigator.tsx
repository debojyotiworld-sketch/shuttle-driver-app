import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
<<<<<<< HEAD
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import OTPScreen from '../screens/OTPScreen';
import SupportScreen from '../screens/SupportScreen';
import MapScreen from '../screens/MapScreen';
import PassengerBoardingScreen from '../screens/PassengerBoardingScreen';
import ActiveRideScreen from '../screens/ActiveRideScreen';
=======
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { supabase } from '../utils/supabase';

// Import Icons
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Import Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import SupportScreen from '../screens/SupportScreen';
import PassengerBoardingScreen from '../screens/PassengerBoardingScreen';
import ActiveRideScreen from '../screens/ActiveRideScreen';
import DriverProfileScreen from '../screens/DriverProfileScreen';
>>>>>>> 0196576 (Major update: Initial commit)

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
<<<<<<< HEAD
        <Stack.Screen
          name="Dashboard"
          component={HomeScreen}
          options={{ title: 'Dashboard', headerBackVisible: false }}
        />
        <Stack.Screen 
=======
        
        <Stack.Screen
          name="Dashboard"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerTitle: 'Driver Dashboard',
            headerRight: () => (
              <View style={styles.headerRightContainer}>
                {/* Profile Icon */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('DriverProfile')}
                  style={styles.iconButton}
                >
                  <MaterialIcons name="account-circle" size={28} color="#2196F3" />
                </TouchableOpacity>

                {/* Logout Icon */}
                <TouchableOpacity
                  onPress={async () => {
                    await supabase.auth.signOut();
                    navigation.replace('Auth');
                  }}
                  style={styles.iconButton}
                >
                  <MaterialIcons name="logout" size={26} color="#F44336" />
                </TouchableOpacity>
              </View>
            ),
          })}
        />

        <Stack.Screen
          name="DriverProfile"
          component={DriverProfileScreen}
          options={{ title: 'My Profile' }}
        />

        <Stack.Screen
>>>>>>> 0196576 (Major update: Initial commit)
          name="Rides"
          component={TripsScreen}
          options={{ title: 'Assigned Rides' }}
        />
<<<<<<< HEAD
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
=======

        {/* ... rest of your screens ... */}
        <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PassengerBoarding" component={PassengerBoardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ActiveRide" component={ActiveRideScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OTP" component={PassengerBoardingScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
});
>>>>>>> 0196576 (Major update: Initial commit)
