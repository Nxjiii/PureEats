import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User fetch error:', userError.message);
        return;
      }

      console.log('User ID:', user.id);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError.message);
      } else {
        console.log('Profile Data:', profileData);
        setProfile(profileData || {});
      }

      const { data: nutritionData, error: nutritionError } = await supabase
        .from('nutrition_profiles')
        .select('allergies, target_calories, target_carbs, target_fats, target_protein')
        .eq('user_id', user.id)
        .single();

      if (nutritionError) {
        console.error('Nutrition fetch error:', nutritionError.message);
      } else {
        console.log('Nutrition Data:', nutritionData);
        setNutritionProfile(nutritionData || {});
      }

    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false); // <-- important!
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {profile && (
        <>
          <Text style={styles.infoText}>Full Name: {profile.full_name}</Text>
          <Text style={styles.infoText}>Username: {profile.username}</Text>
        </>
      )}

      {nutritionProfile && (
        <>
          <Text style={styles.infoText}>Allergies: {nutritionProfile.allergies || 'None'}</Text>
          <Text style={styles.infoText}>Target Calories: {nutritionProfile.target_calories}</Text>
          <Text style={styles.infoText}>Target Carbs: {nutritionProfile.target_carbs}g</Text>
          <Text style={styles.infoText}>Target Fats: {nutritionProfile.target_fats}g</Text>
          <Text style={styles.infoText}>Target Protein: {nutritionProfile.target_protein}g</Text>
        </>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.DeleteButton} onPress={confirmDelete}>
        <Text style={styles.logoutText}>Delete Account</Text>
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
    paddingHorizontal: 20,
  },
  infoText: {
    color: '#E0E0E0',
    fontSize: 16,
    marginVertical: 4,
  },
  logoutButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 30,
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
