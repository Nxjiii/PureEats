import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, View, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);


  //---------------------------fetch user profile and nutrition data-------------------------

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

      const completeProfile = {
        ...(profileData || {}), 
        email: user.email // Add email from auth
      };

      if (profileError) {
        console.error('Profile fetch error:', profileError.message);
      } 
      setProfile(completeProfile); // combined profile both from auth and db

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





  //---------------------------logout function----------------------------------
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
    }
  };





  //---------------------------delete account function-------------------------
  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setDeleting(true);
    try {
      // First verify password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile?.email,
        password: password,
      });

      if (authError) {
        Alert.alert('Error', 'Incorrect password');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
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
    } finally {
      setDeleting(false);
      setPassword('');
      setShowPasswordConfirm(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => setShowPasswordConfirm(true) 
        },
      ]
    );
  };


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
  
  {showPasswordConfirm && (
      <View style={styles.passwordModal}>
      <View style={styles.passwordContainer}>
       <Text style={styles.passwordTitle}>Confirm Password</Text>
      <TextInput
          style={styles.passwordInput}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoFocus
          />
          
        <View style={styles.passwordButtons}>
        <TouchableOpacity 
        style={[styles.passwordButton, styles.cancelButton]}
            onPress={() => {
            setPassword('');
            setShowPasswordConfirm(false);
              }}
              >          
        <Text style={styles.passwordButtonText}>Cancel</Text>
        </TouchableOpacity>

         <TouchableOpacity 
              style={[styles.passwordButton, styles.confirmButton]}
              onPress={handleDeleteAccount}
              disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.passwordButtonText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  borderRadius: 20,
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
passwordModal: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
},
passwordContainer: {
  backgroundColor: '#1E1E1E',
  padding: 20,
  borderRadius: 10,
  width: '80%',
},
passwordTitle: {
  color: '#E0E0E0',
  fontSize: 18,
  marginBottom: 15,
  textAlign: 'center',
},
passwordInput: {
  backgroundColor: '#121212',
  color: '#E0E0E0',
  padding: 12,
  borderRadius: 5,
  marginBottom: 15,
},
passwordButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
passwordButton: {
  padding: 12,
  borderRadius: 5,
  width: '48%',
  alignItems: 'center',
},
cancelButton: {
  backgroundColor: '#333',
},
confirmButton: {
  backgroundColor: '#BB86FC',
},
passwordButtonText: {
  color: '#FFF',
  fontWeight: '500',
},
});

export default ProfileScreen;