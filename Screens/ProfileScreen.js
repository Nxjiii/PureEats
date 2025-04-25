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
  //gonna host separate function for this and call this in the button
  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
  
    try {
      const res = await fetch(`https://delete-gt53.onrender.com/admin/delete-user/${user.id}`, {
        method: 'DELETE',
      });
  
      const result = await res.json();
  
      if (res.ok) {
        await supabase.auth.signOut();
        Alert.alert('Account deleted');
      } else {
        Alert.alert('Error', result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  //Alert
  const confirmDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.DeleteButton} onPress={confirmDelete}>
      <Text>Delete Account</Text>
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

  DeleteButton: {
    backgroundColor: '#D32F2F', 
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20, 
    
  },
});

export default ProfileScreen;