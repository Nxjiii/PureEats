import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomeScreen from './Screens/HomeScreen';
import ProfileScreen from './Screens/ProfileScreen';
import ChatbotScreen from './Screens/ChatbotScreen';
import CommunityScreen from './Screens/CommunityScreen';



const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



// Bottom Tab Navigator for main screens
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarStyle: {backgroundColor: '#2E3837',  borderTopWidth: 0, }, }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Community" component={CommunityScreen}  options={{ headerShown: false }}/>

    </Tab.Navigator>
  );
}

// Main App Navigation
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
