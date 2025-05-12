import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import MainNavigator from './navigation/MainNavigator';

//navigation reference for use outside of components
export const navigationRef = createNavigationContainerRef();

// Main App Component
function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <MainNavigator />
    </NavigationContainer>
  );
}

export default App;