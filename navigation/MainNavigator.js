import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../lib/supabaseClient';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import SetupProfileScreen from '../Screens/SetupProfileScreen';
import { ActivityIndicator, View } from 'react-native';
import LoggedMeals from '../Screens/LoggedMeals';
import BackButton from '../components/BackButton';

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

// Define common header styling for dark theme
const darkHeaderStyle = {
  headerStyle: {
    backgroundColor: '#121212', // Match your page background
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
  },
  headerTintColor: '#BB86FC', // Match your purple accent color
  headerTitleStyle: {
    color: '#FFFFFF', // White text for header titles
  }
};

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
    </Stack.Navigator>
  );
}

function ContentNavigator() {
  // Apply dark header styling to all screens in this navigator
  return (
    <Stack.Navigator
      screenOptions={darkHeaderStyle}
    >
      {/* MainTabs doesn't need a header */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }} 
      />
      
      {/* Any additional screens that should have back buttons */}
      <Stack.Screen 
        name="LoggedMeals" 
        component={LoggedMeals}
        options={{
          headerTitle: 'Logged Meals',
          headerLeft: () => <BackButton />
        }}
      />
      {/* Add other non-tab screens here with similar configuration */}
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if profile has all required fields
  const checkProfileComplete = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, dob, gender, allergies, goals, profile_complete')
        .eq('id', userId)
        .maybeSingle();  
  
      if (!data) return false;
  
      if (error) throw error;
  
      return data.profile_complete || Boolean(
        data.username &&
        data.full_name &&
        data.dob &&
        data.gender &&
        data.allergies?.length > 0 &&
        data.goals
      );
    } catch (error) {
      console.error('Profile check error:', error);
      return false;
    }
  };
  
  useEffect(() => {
    const fetchAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          const complete = await checkProfileComplete(currentUser.id);
          setIsProfileComplete(complete);
        }
      } catch (error) {
        console.error('Initial auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthState();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
    
        if (currentUser) {
          const complete = await checkProfileComplete(currentUser.id);
          setIsProfileComplete(complete);
        } else {
          setIsProfileComplete(false);
        }
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  return (
    <RootStack.Navigator
      screenOptions={darkHeaderStyle}
    >
      {!user ? (
        <RootStack.Screen 
          name="Auth" 
          component={AuthNavigator} 
          options={{ headerShown: false }}
        />
      ) : !isProfileComplete ? (
        <RootStack.Screen
          name="SetupProfile"
          component={SetupProfileScreen}
          initialParams={{
            userId: user.id,
            userEmail: user.email,
          }}
          options={{
            headerTitle: 'Complete Your Profile',
            headerLeft: () => <BackButton />
          }}
        />
      ) : (
        <RootStack.Screen 
          name="Main" 
          component={ContentNavigator} 
          options={{ headerShown: false }}
        />
      )}
    </RootStack.Navigator>
  );
}