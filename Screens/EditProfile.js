import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import CustomCheckbox from '../components/CustomCheckbox';

const EditProfile = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: ''
  });
  const [nutritionProfile, setNutritionProfile] = useState({
    allergies: [],
    target_calories: '',
    target_carbs: '',
    target_fats: '',
    target_protein: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();

      const { data: nutritionData } = await supabase
        .from('nutrition_profiles')
        .select('allergies, target_calories, target_carbs, target_fats, target_protein')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData || {});
      setNutritionProfile(nutritionData || {});
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllergyChange = (allergy) => {
    if (nutritionProfile.allergies === null) return;
    
    const newAllergies = nutritionProfile.allergies.includes(allergy)
      ? nutritionProfile.allergies.filter(a => a !== allergy)
      : [...nutritionProfile.allergies, allergy];
    
    setNutritionProfile({ ...nutritionProfile, allergies: newAllergies });
  };

  const handleNoAllergiesChange = () => {
    const newAllergies = nutritionProfile.allergies === null ? [] : null;
    setNutritionProfile({ ...nutritionProfile, allergies: newAllergies });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);
      
      await supabase
        .from('nutrition_profiles')
        .update(nutritionProfile)
        .eq('user_id', user.id);
      
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ActivityIndicator size="large" color="#BB86FC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={profile.full_name}
                onChangeText={(text) => setProfile({ ...profile, full_name: text })}
                placeholder="Enter your full name"
                placeholderTextColor="#6D6D6D"
                selectionColor="#BB86FC"
              />
            </View>
            
            <View style={styles.spacer} />
            <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.usernameContainer}>
         <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={profile.username}
           editable={false}
           selectable={false}
           />
            <View style={styles.viewOnlyBadge}>
           <Text style={styles.viewOnlyText}>View Only</Text>
          </View>
          </View>
         </View>

          </View>
        </View>

        {/* Allergies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <View style={styles.card}>
            <Text style={styles.subLabel}>Select your allergies</Text>
            
            <View style={styles.checkboxGrid}>
              {['Nuts', 'Seafood', 'Dairy', 'Eggs', 'Gluten'].map((allergy) => (
                <View key={allergy} style={styles.checkboxWrapper}>
                  <CustomCheckbox
                    label={allergy}
                    value={Array.isArray(nutritionProfile.allergies) && nutritionProfile.allergies.includes(allergy)}
                    onValueChange={() => handleAllergyChange(allergy)}
                    disabled={nutritionProfile.allergies === null}
                  />
                </View>
              ))}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.noAllergyWrapper}>
              <CustomCheckbox
                label="I have no food allergies"
                value={nutritionProfile.allergies === null}
                onValueChange={handleNoAllergiesChange}
              />
            </View>
          </View>
        </View>

       {/* Nutrition Targets */}
     <View style={styles.section}>
    <Text style={styles.sectionTitle}>Nutrition Targets</Text>

    <View style={styles.card}>
    <View style={styles.macrosContainer}>
    <View style={styles.macroItem}>
    <Text style={styles.macroLabel}>Daily Calories</Text>
    <View style={styles.macroValueContainer}>
      
          <TextInput
            style={styles.disabledInput}
            value={nutritionProfile.target_calories?.toString() || '0'}
            editable={false}
            selectable={false}
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>kcal</Text>
          </View>
        </View>
      </View>

      <View style={styles.macroItem}>
        <Text style={styles.macroLabel}>Carbs</Text>
        <View style={styles.macroValueContainer}>
          <TextInput
            style={styles.disabledInput}
            value={nutritionProfile.target_carbs?.toString() || '0'}
            editable={false}
            selectable={false}
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>g</Text>
          </View>
        </View>
      </View>

      <View style={styles.macroItem}>
        <Text style={styles.macroLabel}>Protein</Text>
        <View style={styles.macroValueContainer}>
          <TextInput
            style={styles.disabledInput}
            value={nutritionProfile.target_protein?.toString() || '0'}
            editable={false}
            selectable={false}
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>g</Text>
          </View>
        </View>
      </View>

      <View style={styles.macroItem}>
        <Text style={styles.macroLabel}>Fats</Text>
        <View style={styles.macroValueContainer}>
          <TextInput
            style={styles.disabledInput}
            value={nutritionProfile.target_fats?.toString() || '0'}
            editable={false}
            selectable={false}
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>g</Text>
          </View>
        </View>
      </View>
    </View>
          
    <TouchableOpacity 
      style={styles.recalculateButton}
      onPress={() => navigation.navigate('Recalculate')}
    >
      <Text style={styles.recalculateText}>Recalculate Macros</Text>
    </TouchableOpacity>
  </View>
</View>



        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saveLoading}
          >
            {saveLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#BB86FC',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    color: '#A0A0A0',
    fontSize: 15,
    marginBottom: 12,
    fontWeight: '500',
  },
  subLabel: {
    color: '#A0A0A0',
    fontSize: 15,
    marginBottom: 16,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  spacer: {
    height: 20,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  checkboxWrapper: {
    width: '50%',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  noAllergyWrapper: {
    paddingTop: 8,
  },
  
  buttonContainer: {
    marginTop: 32,
  },
  saveButton: {
    backgroundColor: '#BB86FC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#BB86FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  cancelButtonText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontWeight: '500',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#262626',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  viewOnlyBadge: {
    backgroundColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    position: 'absolute',
    right: 14,
  },
  viewOnlyText: {
    color: '#BB86FC',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: 'transparent',
    borderWidth: 0,
    flex: 1,
  },
  macroLabel: {
    color: '#A0A0A0',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  macrosContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '48%',
    marginBottom: 12,
  },
  macroValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#262626',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    height: 44,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: 'transparent',
    borderWidth: 0,
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  unitBadge: {
    backgroundColor: '#333333',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    right: 10,
  },
  unitText: {
    color: '#BB86FC',
    fontSize: 11,
    fontWeight: '600',
  },
  recalculateButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    marginTop: 6,
  },
  recalculateText: {
    color: '#BB86FC',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default EditProfile;