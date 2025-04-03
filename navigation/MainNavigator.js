import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../lib/supabaseClient';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import SetupProfileScreen from '../Screens/SetupProfileScreen';
import { ActivityIndicator, View } from 'react-native';
import LoggedMeals from '../Screens/LoggedMeals';  // Import LoggedMeals screen

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
    </Stack.Navigator>
  );
}

function ContentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
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
  
      // No error and no data means profile doesn't exist yet
      if (!data) return false;
  
      if (error) throw error;
  
      // Check both the explicit flag and required fields as fallback
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
        // Check current auth state
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

    // Listen for auth state changes
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
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : !isProfileComplete ? (
        <RootStack.Screen
          name="SetupProfile"
          component={SetupProfileScreen}
          initialParams={{
            userId: user.id,
            userEmail: user.email,
          }}
        />
      ) : (
        <>
          <RootStack.Screen name="Main" component={ContentNavigator} />
          {/* Add LoggedMeals screen here */}
          <RootStack.Screen name="LoggedMeals" component={LoggedMeals} />
        </>
      )}
    </RootStack.Navigator>
  );
}
