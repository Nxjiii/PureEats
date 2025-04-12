import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../lib/supabaseClient';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import SetupProfileScreen from '../Screens/SetupProfileScreen';
import { ActivityIndicator, View } from 'react-native';
import LoggedMeals from '../Screens/LoggedMeals';
import BackButton from '../components/BackButton';
import Logger from '../Screens/Logger'; 
import Search from '../Screens/Search.js';

// Stack navigators
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

// Common header styling for dark theme
const darkHeaderStyle = {
  headerStyle: {
    backgroundColor: '#121212', 
    shadowOpacity: 0,           
  },
  headerTintColor: '#BB86FC',    
  headerTitleStyle: {
    color: '#FFFFFF',          
  },
};


// Auth flow navigator
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
    </Stack.Navigator>
  );
}

// Main content navigator (after auth + profile setup)
function ContentNavigator() {
  return (
    <Stack.Navigator screenOptions={darkHeaderStyle}>
      {/* Tabbed screens (no header) */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* Additional screens navigated to from tabs */}
      <Stack.Screen
        name="LoggedMeals"
        component={LoggedMeals}
        options={{
          headerTitle: 'Logged Meals',
          headerLeft: () => <BackButton />
        }}

      />
       <Stack.Screen
        name="Logger"
        component={Logger}
        options={{
        headerTitle: 'Logger',
         headerLeft: () => <BackButton />,
        }}
        />    
      
      <Stack.Screen 
      name="Search" 
      component={Search}
      options={{
      headerTitle: 'Search',
      headerLeft: () => <BackButton />,
        }}
       />



    </Stack.Navigator>
  );
}



// Main navigator controlling all flows: auth, setup, and app
export default function MainNavigator() {
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check if user's profile is complete
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

  // On mount: check session and profile
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

    // Subscribe to auth state changes
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

    // Cleanup auth listener on unmount
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // While loading: show spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  // Render root stack based on user state
  return (
    <RootStack.Navigator screenOptions={darkHeaderStyle}>
      {/* No user = show login/signup */}
      {!user ? (
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />

      // Logged in but profile not complete = show setup
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

      // Authenticated and setup = show full app
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
