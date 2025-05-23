import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/HomeScreen';
import ChatbotScreen from '../Screens/ChatbotScreen';
import Logger from '../Screens/Logger';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: '#121212', 
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          backgroundColor: 'transparent', 
        },
        tabBarActiveTintColor: '#BB86FC', 
        tabBarInactiveTintColor: '#9E9E9E',
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Log" component={Logger} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}