import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
          options={({ navigation }) => ({
            headerTitle: 'Dashboard',
            headerRight: () => (
              <View style={styles.headerRightContainer}>
                {/* Profile Icon */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('DriverProfile')}
                  style={styles.iconButton}
                >
                  <MaterialIcons name="account-circle" size={28} color="#009688" />
                </TouchableOpacity>

                {/* Logout Icon */}
                <TouchableOpacity
                  onPress={async () => {
                    await supabase.auth.signOut();
                    navigation.replace('Auth');
                  }}
                  style={styles.iconButton}
                >
                  <MaterialIcons name="logout" size={26} color="#00796B" />
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
          name="Rides"
          component={TripsScreen}
        />

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
