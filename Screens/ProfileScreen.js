import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [loading, setLoading] = useState(true);



  //display user profile and nutrition data
  const fetchProfileData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User fetch error:', userError.message);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError.message);
      } else {
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
        setNutritionProfile(nutritionData || {});
      }

    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);


  //logout function
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <Text style={styles.headerText}>Profile</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{profile?.full_name || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{profile?.username || 'Not set'}</Text>
            </View>
          </View>
        </View>

        {nutritionProfile && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Your Targets</Text>
    
    <View style={styles.infoCard}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Allergies</Text>
        <Text style={styles.infoValue}>
        {nutritionProfile.allergies && nutritionProfile.allergies.length > 0 ? nutritionProfile.allergies.join(', ') : 'None'}
        </Text>
      </View>
      
      <View style={styles.macrosContainer}>
        <View style={[styles.macroPill, styles.caloriesPill]}>
          <Text style={styles.macroLabel}>Calories</Text>
          <Text style={styles.macroValue}>
            {nutritionProfile.target_calories ? `${nutritionProfile.target_calories}cal` : 'Not set'}
          </Text>
        </View>
        
        <View style={styles.macroPill}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroValue}>{nutritionProfile.target_carbs || '0'}g</Text>
        </View>
        
        <View style={styles.macroPill}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroValue}>{nutritionProfile.target_protein || '0'}g</Text>
        </View>
        
        <View style={styles.macroPill}>
          <Text style={styles.macroLabel}>Fats</Text>
          <Text style={styles.macroValue}>{nutritionProfile.target_fats || '0'}g</Text>
        </View>
      </View>
    </View>
  </View>
)}

       <View style={styles.buttonsContainer}>
       <TouchableOpacity 
      style={[styles.button, styles.editButton]}
      onPress={() => navigation.navigate('EditProfile')}
     >
    <Text style={styles.buttonText}>Edit Profile</Text>
    </TouchableOpacity>
  
    <View style={styles.divider} />
  
    <TouchableOpacity 
    style={[styles.button, styles.logoutButton]} 
    onPress={handleLogout}
    >
    <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  
  <View style={styles.divider} />
  
  <TouchableOpacity 
    style={[styles.button, styles.deleteButton]} 
    onPress={confirmDelete}
    >
    <Text style={[styles.buttonText, styles.deleteText]}>Delete Account</Text>
  </TouchableOpacity>
  </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#BB86FC',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    paddingLeft: 8,
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: '#A0A0A0',
    fontSize: 15,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    flexWrap: 'wrap',
  },
  macroPill: {
    backgroundColor: '#2D2D2D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    minWidth: '15%',
    marginBottom: 10,
  },
  caloriesPill: {
    backgroundColor: '#2D2D2D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    minWidth: '15%',
    marginBottom: 10,
  },
  macroLabel: {
    color: '#BB86FC',
    fontSize: 12,
    fontWeight: '500',
  },
  macroValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
buttonsContainer: {
  marginTop: 24,
  borderTopWidth: 1,
  borderTopColor: '#2A2A2A',
  paddingTop: 12,
},
button: {
  borderRadius: 6,
  paddingVertical: 12,
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 0,
  backgroundColor: 'transparent',
  alignSelf: 'center',
  minWidth: '60%',
},
editButton: {
  borderWidth: 1,
  borderColor: '#3A3A3A',
},
logoutButton: {
  borderWidth: 1,
  borderColor: '#3A3A3A',
},
deleteButton: {
  borderWidth: 1,
  borderColor: '#3A3A3A',
},
buttonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '500',
  letterSpacing: 0.5,
},
deleteText: {
  color: '#FF5252',
},
divider: {
  height: 1,
  backgroundColor: '#2A2A2A',
  marginVertical: 6,
},
});

export default ProfileScreen;