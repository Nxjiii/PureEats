import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomeScreen from './Screens/HomeScreen';
import LoadingScreen from './Screens/LoadingScreen';
import ProfileScreen from './Screens/ProfileScreen';
import ChatbotScreen from './Screens/ChatbotScreen';
import CommunityScreen from './Screens/CommunityScreen';



const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



// Bottom Tab Navigator for main screens
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />

    </Tab.Navigator>
  );
}

// Main App Navigation
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
