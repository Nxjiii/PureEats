import React from 'react';
import { useState} from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

function ProfileScreen() {
  const navigation = useNavigation();


     //Logging out
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
    }
  };


  //Account deletion
  //gonna host separate function for this and call it in the button

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    color: '#BB86FC',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logoutText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
});

export default ProfileScreen;