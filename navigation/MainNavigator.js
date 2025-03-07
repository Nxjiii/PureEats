import React, { useState, useEffect } from 'react'; 
import { createStackNavigator } from '@react-navigation/stack'; 
import { supabase } from '../lib/supabaseClient'; 
import MainTabs from './MainTabs'; 
import AuthStack from './AuthStack'; 
import SetupProfileScreen from '../Screens/SetupProfileScreen'; 
import { ActivityIndicator, View } from 'react-native';  

const Stack = createStackNavigator(); 
const RootStack = createStackNavigator();  

// Auth navigator with login/signup screens 
function AuthNavigator() {   
  return (     
    <Stack.Navigator screenOptions={{ headerShown: false }}>       
      <Stack.Screen name="AuthStack" component={AuthStack} />     
    </Stack.Navigator>   
  ); 
}  

// Main content navigator 
function ContentNavigator() {   
  return (     
    <Stack.Navigator screenOptions={{ headerShown: false }}>       
      <Stack.Screen name="MainTabs" component={MainTabs} />       
      <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />     
    </Stack.Navigator>   
  ); 
}  

// Root navigator that handles auth state 
export default function MainNavigator() {   
  const [user, setUser] = useState(null);   
  const [isProfileComplete, setIsProfileComplete] = useState(false);   
  const [loading, setLoading] = useState(true);    
  
  useEffect(() => {     
    const fetchUser = async () => {       
      const { data: { session } } = await supabase.auth.getSession();       
      const user = session?.user || null;       
      setUser(user);        
      
      if (user) {         
        // Check if this is a new user from signup (has isNewUser metadata)
        const isNewSignup = user.user_metadata?.isNewUser || false;
        
        if (isNewSignup) {
          // New signup - check profile completion
          const { data, error } = await supabase
            .from('profiles')
            .select('profile_complete')
            .eq('id', user.id)
            .single();
            
          if (!error && data) {           
            setIsProfileComplete(data.profile_complete);         
          }
        } else {
          // Existing user login - skip profile check, assume complete
          setIsProfileComplete(true);
        }
      }
      setLoading(false);     
    };      
    
    fetchUser();      
    
    // Listen for authentication state changes     
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {       
      const user = session?.user || null;       
      setUser(user);        
      
      if (user) {         
        // Check if this is a new user from signup
        const isNewSignup = user.user_metadata?.isNewUser || false;
        
        if (isNewSignup) {
          // For new users, check profile completion status
          supabase
            .from('profiles')
            .select('profile_complete')
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => {             
              if (!error && data) {               
                setIsProfileComplete(data.profile_complete);             
              }           
            });
        } else {
          // For regular logins, assume profile is complete
          setIsProfileComplete(true);
        }       
      }        
      
      setLoading(false);     
    });      
    
    return () => authListener.subscription.unsubscribe();   
  }, []);    
  
  if (loading) {     
    return (       
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>         
        <ActivityIndicator size="large" color="#2E3837" />       
      </View>     
    );   
  }    
  
  return (     
    <RootStack.Navigator screenOptions={{ headerShown: false }}>       
      {!user ? (         
        <RootStack.Screen name="Auth" component={AuthNavigator} />       
      ) : !isProfileComplete ? (         
        <RootStack.Screen name="SetupProfileScreen" component={SetupProfileScreen} />       
      ) : (         
        <RootStack.Screen name="Main" component={ContentNavigator} />       
      )}     
    </RootStack.Navigator>   
  ); 
}