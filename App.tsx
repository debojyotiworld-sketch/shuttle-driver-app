<<<<<<< HEAD
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
=======
import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
>>>>>>> 0196576 (Major update: Initial commit)
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';

enableScreens();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
<<<<<<< HEAD
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
=======
      <View style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </View>
>>>>>>> 0196576 (Major update: Initial commit)
    </SafeAreaProvider>
  );
}

<<<<<<< HEAD
/* const styles = StyleSheet.create({
=======
const styles = StyleSheet.create({
>>>>>>> 0196576 (Major update: Initial commit)
  container: {
    flex: 1,
  },
});
<<<<<<< HEAD
 */
=======

>>>>>>> 0196576 (Major update: Initial commit)
export default App;
