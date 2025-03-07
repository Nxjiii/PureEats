import 'react-native-url-polyfill/auto';   
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from './lib/supabaseClient';
import MainNavigator from './navigation/MainNavigator';
import AuthStack from './navigation/AuthStack';
import MainTabs from './navigation/MainTabs';
import SetupProfileScreen from './Screens/SetupProfileScreen';

export const navigationRef = createNavigationContainerRef();

// Root component to manage navigation state
function Root() {
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsNewUser(session?.user?.user_metadata?.isNewUser || false);
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsNewUser(session?.user?.user_metadata?.isNewUser || false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E3837" />
      </View>
    );
  }

  if (!user) return <AuthStack />;
  if (isNewUser) return <SetupProfileScreen />;
  return <MainTabs />;
}

// Main App Component
function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <MainNavigator />
    </NavigationContainer>
  );
}

export default App;
