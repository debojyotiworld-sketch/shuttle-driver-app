import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import RidesScreen from '../screens/RidesScreen';
import MapScreen from '../screens/MapScreen';
import QRScreen from '../screens/QRScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {() => <LoginScreen onLogin={() => setIsAuthenticated(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
              name="Rides"
              component={RidesScreen}
              options={{ title: 'Assigned Rides' }}
            />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="QR" component={QRScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}