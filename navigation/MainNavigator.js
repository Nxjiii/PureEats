import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../lib/supabaseClient';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import SetupProfileScreen from '../Screens/SetupProfileScreen';
import ProfileScreen from '../Screens/ProfileScreen.js';  
import Welcome from '../Screens/Welcome.js';
import Meals from '../Screens/Meals';
import BackButton from '../components/BackButton';
import Logger from '../Screens/Logger'; 
import Search from '../Screens/Search.js';
import { ActivityIndicator, View } from 'react-native';
import Recipes from '../Screens/Recipes.js';
import RecipeDetails from '../Screens/RecipeDetails.js';
import LoggedFoods from '../Screens/LoggedFoods.js';  
import SelectMeal from '../Screens/SelectMealForLog.js';
import FoodDetails from '../Screens/FoodDetails.js';
import EditProfile from '../Screens/EditProfile.js';
import Recalculate from '../Screens/Recalculate.js';


// Stack navigators
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

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
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profile',
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerTitle: 'Edit Profile',
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="Recalculate"
        component={Recalculate}
        options={{
          headerTitle: 'Recalculate',
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="Meals"
        component={Meals}
        options={{
          headerTitle: 'Logged Meals',
          headerLeft: () => <BackButton />,
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
      
      <Stack.Screen
        name="Recipes"
        component={Recipes}
        options={{
          headerLeft: () => <BackButton />,
        }}
      />
      
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetails}
        options={{
          headerTitle: 'Recipe Details',
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="LoggedFoods"
        component={LoggedFoods}
        options={{
          headerTitle: 'Logged Foods',
          headerLeft: () => <BackButton />,
        }}
      />
     
      <Stack.Screen
        name="SelectMeal"
        component={SelectMeal}
        options={{
          headerTitle: 'Select Meal Type',
          headerLeft: () => <BackButton />,
        }}
      />
    
      <Stack.Screen
        name="FoodDetails"
        component={FoodDetails}
        options={{
          headerTitle: 'Food Details',
          headerLeft: () => <BackButton />,
        }}
      />
      
    </Stack.Navigator>
  );
}



// Main navigator controlling all flows: auth, setup, welcome, and app
export default function MainNavigator() {
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkProfileComplete = async (userId) => {
    try {
      // Query the 'profiles' table to check if the user profile is complete
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, gender, profile_complete')
        .eq('id', userId)
        .maybeSingle();
  
      if (profileError) {
        return false;
      }
  
      if (!profileData) {
        return false;
      }
  
      // Now check if there's a nutrition profile for the user in the 'nutrition_profiles' table
      const { data: nutritionData, error: nutritionError } = await supabase
        .from('nutrition_profiles')
        .select('allergies, goal, intensity, target_calories, target_protein, target_carbs, target_fats')
        .eq('user_id', userId)
        .maybeSingle();
  
      if (nutritionError) {
        return false;
      }
  
      if (!nutritionData) {
        return false;
      }
  
      // Check if profile data is complete
      return (
        (profileData.profile_complete || Boolean(
          profileData.username &&
          profileData.full_name &&
          profileData.gender
        )) &&
        nutritionData.allergies &&
        nutritionData.goal &&
        nutritionData.intensity &&
        nutritionData.target_calories &&
        nutritionData.target_protein &&
        nutritionData.target_carbs &&
        nutritionData.target_fats
      );
    } catch (error) {
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
    <RootStack.Navigator screenOptions={darkHeaderStyle}>
      {!user ? (
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      ) : !isProfileComplete ? (

        
        <RootStack.Screen
        name="SetupProfile"
        options={{
          headerTitle: 'Complete Your Profile',
        }}
      >
        {(props) => (
          <SetupProfileScreen
            {...props}
            userId={user?.id}
            userEmail={user?.email}
            onProfileComplete={() => {
              console.log('onProfileComplete invoked in MainNavigator.');
              setIsProfileComplete(true);
            }}
          />
        )}
      </RootStack.Screen>
      
      ) : (
        <RootStack.Screen
          name="Main"
          component={ContentNavigator}
          options={{ headerShown: false }}
        />
      )}
  
      {/* Always available in root stack */}
      <RootStack.Screen
        name="Welcome"
        component={Welcome}
        options={{
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  );
}