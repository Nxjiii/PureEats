import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, Animated, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../lib/supabaseClient';
import { useRoute } from '@react-navigation/native';
import CustomCheckbox from './CustomCheckbox';
import RNFS from 'react-native-fs';


const SetupProfileScreen = ({ navigation }) => {
  const route = useRoute();
  const userId = route.params?.userId;
  const [step, setStep] = useState(0);
  const [nameAnimation] = useState(new Animated.Value(0));
  const [profilePicture, setProfilePicture] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  const [profileData, setProfileData] = useState({
    full_name: '',
    username: '',
    dob: '',
    gender: '',
    allergies: [],
    goals: '',
    profile_picture_url: ''
  });

  const updateField = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Username validation
  const checkUsername = async () => {
    if (!profileData.username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return false;
    }

    if (profileData.username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      Alert.alert('Error', 'Only letters, numbers and underscores');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', profileData.username.trim())
        .neq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const isAvailable = !data;
      setUsernameAvailable(isAvailable);
      if (!isAvailable) {
        Alert.alert('Username Taken', 'Please choose another username');
      }
      return isAvailable;
    } catch (error) {
      Alert.alert('Error', 'Failed to check username');
      return false;
    }
  };

  const calculateAge = (dob) => {
    // Assumes DOB is in format YYYY-MM-DD
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Field validation checks
  const isNameValid = () => profileData.full_name.trim().length >= 2;
  const isUsernameValid = () => usernameAvailable && profileData.username.length >= 3;
  const isDOBValid = () => {
    if (!profileData.dob) return false;
    // Validate format and age
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(profileData.dob)) return false;
    const age = calculateAge(profileData.dob);
    return age >= 16;
  };
  const isGenderValid = () => !!profileData.gender;
  const isAllergiesValid = () => profileData.allergies.length > 0;
  const isgoalsValid = () => !!profileData.goals;

  // Handle Next step with animation for first step
  const handleNext = async () => {
    if (step === 0) {
      // First step: animate and move to next step
      Animated.timing(nameAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setStep(1));
      return;
    }

    // validation logic for other steps
    if (step === 1 && !isNameValid()) {
      Alert.alert('Invalid Name', 'Please enter your full name');
      return;
    }
    if (step === 2) {
      const isValid = await checkUsername();
      if (!isValid) return;
    }
    if (step === 3 && !isDOBValid()) {
      Alert.alert('Invalid Date', 'Please enter a valid date. You must be at least 16 years old.');
      return;
    }
    if (step === 4 && !isGenderValid()) {
      Alert.alert('Invalid Selection', 'Please select your gender');
      return;
    }
    if (step === 5 && !isAllergiesValid()) {
      Alert.alert('Invalid Selection', 'Please select at least one allergy');
      return;
    }
    if (step === 6 && !isgoalsValid()) {
      Alert.alert('Invalid Selection', 'Please select your goals');
      return;
    }

    setStep(prev => prev + 1);
  };



  // Image handling
const pickImage = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.7,
    includeBase64: false,
  });

  if (result.didCancel) return;
  if (result.errorCode) {
    Alert.alert('Error', 'Failed to select image');
    return;
  }

  const { uri, fileName, type } = result.assets[0];

  try {
    const fileStat = await RNFS.stat(uri);
    const fileSize = fileStat.size;

    if (fileSize > 2 * 1024 * 1024) {
      Alert.alert('Image Too Large', 'Please select an image under 2MB.');
      return;
    }

    setProfilePicture(uri);

    const fileExtension = fileName?.split('.').pop() || 'jpg';
    const supaFileName = `${userId}-${Date.now()}.${fileExtension}`;
    const fileType = type || `image/${fileExtension}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(supaFileName, blob, {
        contentType: fileType,
        upsert: true,
      });

    if (error) throw error;

    // ✅ Generate a signed URL (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('profile-pictures')
      .createSignedUrl(supaFileName, 60 * 60 * 24 * 365); // 1 year

    if (urlError) throw urlError;

    updateField('profile_picture_url', signedUrlData.signedUrl);
  } catch (err) {
    console.error(err);
    Alert.alert('Upload Failed', 'Something went wrong while uploading the image.');
  }
};


const handleCompleteProfile = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId,
        ...profileData,
        profile_complete: true,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    
    // Trigger a re-render in MainNavigator
    const { data: { session } } = await supabase.auth.getSession();
    // This will cause the auth listener to update the state
    await supabase.auth.onAuthStateChange.triggerEvent('PROFILE_COMPLETE', session);
    
    Alert.alert('Success', 'Profile setup complete!');
  } catch (error) {
    Alert.alert('Error', 'Failed to save profile');
  }
};

const handleSkipProfilePicture = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId,
        ...profileData,
        profile_complete: true,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Remove navigation call
    Alert.alert('Success', 'Profile setup complete!');
  } catch (error) {
    console.error('Error saving profile:', error);
    Alert.alert('Error', 'Failed to save profile');
  }
};
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your profile</Text>

      {/* Step 0 - Welcome */}
      {step === 0 && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Welcome to your profile setup!</Text>
          <View style={styles.buttonWrapper}>
            <Button 
              title="Let's Get Started" 
              onPress={handleNext} 
              color="#BB86FC"
            />
          </View>
        </View>
      )}

      {/* Step 1 - Full Name with Animation */}
      {step === 1 && (
        <View style={styles.inputContainer}>
          <Animated.View style={[styles.animatedView, { opacity: nameAnimation }]}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9E9E9E"
                value={profileData.full_name}
                onChangeText={(text) => updateField('full_name', text)}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button 
                title="Next" 
                onPress={handleNext} 
                color="#BB86FC"
                disabled={!isNameValid()}
              />
            </View>
          </Animated.View>
        </View>
      )}

      {/* Step 2 - Username */}
      {step === 2 && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, !usernameAvailable && styles.inputError]}
              placeholder="Choose a username"
              placeholderTextColor="#9E9E9E"
              value={profileData.username}
              onChangeText={(text) => {
                updateField('username', text);
                setUsernameAvailable(true);
              }}
              autoCapitalize="none"
            />
            {!usernameAvailable && (
              <Text style={styles.errorText}>Username not available</Text>
            )}
          </View>
          <View style={styles.buttonWrapper}>
            <Button 
              title="Check Availability" 
              onPress={checkUsername} 
              color="#BB86FC"
              disabled={!profileData.username.trim()}
            />
            <Button 
              title="Next" 
              onPress={handleNext} 
              color="#BB86FC"
              disabled={!isUsernameValid()}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      )}

      {/* Step 3 - Date of Birth */}
      {step === 3 && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Enter Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9E9E9E"
              value={profileData.dob}
              onChangeText={(text) => updateField('dob', text)}
              keyboardType="numeric"
              maxLength={10}
            />
            {profileData.dob && (
              <Text style={styles.hintText}>
                Age: {calculateAge(profileData.dob)} years
              </Text>
            )}
          </View>
          <View style={styles.buttonWrapper}>
            <Button 
              title="Next" 
              onPress={handleNext} 
              color="#BB86FC"
              disabled={!isDOBValid()}
            />
          </View>
        </View>
      )}

      {/* Step 4 - Gender */}
      {step === 4 && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select your gender</Text>
          <View style={styles.genderButtonContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                profileData.gender === 'male' && styles.genderButtonSelected
              ]}
              onPress={() => updateField('gender', 'male')}
            >
              <Text style={styles.genderButtonText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                profileData.gender === 'female' && styles.genderButtonSelected
              ]}
              onPress={() => updateField('gender', 'female')}
            >
              <Text style={styles.genderButtonText}>Female</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonWrapper}>
            <Button 
              title="Next" 
              onPress={handleNext} 
              color="#BB86FC"
              disabled={!isGenderValid()}
            />
          </View>
        </View>
      )}

    {/* Step 5 - Allergies */}
{step === 5 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Select your allergies</Text>
    <View style={styles.checkboxContainer}>
      {['Peanuts', 'Shellfish', 'Dairy', 'Eggs', 'Gluten'].map((allergy) => (
        <CustomCheckbox
          key={allergy}
          label={allergy}
          value={profileData.allergies.includes(allergy)}
          onValueChange={() => {
            const newAllergies = profileData.allergies.includes(allergy)
              ? profileData.allergies.filter(a => a !== allergy)
              : [...profileData.allergies, allergy];
            updateField('allergies', newAllergies);
          }}
        />
      ))}
    </View>
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={!isAllergiesValid()}
      />
    </View>
  </View>
)}

{/* Step 6 - goals */}
{step === 6 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Select your goals</Text>
    <View style={styles.checkboxContainer}>
      {['Weight Loss', 'Bulk', 'Eat Healthier', 'Maintain'].map((goals) => (
        <TouchableOpacity
          key={goals}
          style={[
            styles.goalsButton,
            profileData.goals === goals && styles.goalsButtonSelected
          ]}
          onPress={() => updateField('goals', goals)}
        >
          <Text style={styles.goalsButtonText}>{goals}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={!isgoalsValid()}
      />
    </View>
  </View>
)}

      {/* Step 7 - Profile Picture */}
      {step === 7 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Upload your profile picture (optional)</Text>
    <View style={styles.buttonWrapper}>
      <Button 
        title="Choose Image" 
        onPress={pickImage} 
        color="#BB86FC"
      />
    </View>
    {profilePicture && (
      <Image 
        source={{ uri: profilePicture }} 
        style={styles.imagePreview} 
      />
    )}
    <View style={styles.buttonRow}>
      <Button 
        title="Skip for Now" 
        onPress={handleSkipProfilePicture} 
        color="#9E9E9E"
      />
      <Button 
        title="Complete Setup" 
        onPress={handleCompleteProfile} 
        color="#BB86FC"
      />
    </View>
  </View>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#BB86FC',
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  animatedView: {
    width: '100%',
    alignItems: 'center'
  },
  inputWrapper: {
    width: '80%',
    marginBottom: 15,
  },
  input: {
    height: 40,
    backgroundColor: '#1E1E1E',
    color: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF5555',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF5555',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    width: '80%',
  },
  buttonWrapper: {
    width: '80%',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20
  },
  label: {
    color: '#E0E0E0',
    fontSize: 16,
    marginBottom: 10,
    width: '80%',
    textAlign: 'left',
  },
  checkboxContainer: {
    width: '80%',
    marginBottom: 15,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    color: '#E0E0E0',
    marginLeft: 8,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 20,
    backgroundColor: '#1E1E1E',
  },
  hintText: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  genderButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  genderButton: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#BB86FC',
  },
  genderButtonText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  goalsButton: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  goalsButtonSelected: {
    backgroundColor: '#BB86FC',
  },
  goalsButtonText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
});

export default SetupProfileScreen;