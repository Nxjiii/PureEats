import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, Animated, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import BackButton from '../components/BackButton';
import { supabase } from '../lib/supabaseClient';
import { useRoute } from '@react-navigation/native';
import CustomCheckbox from '../components/CustomCheckbox';
import CalorieCalculator from '../components/CalorieCalculator';
import RNFS from 'react-native-fs';

const SetupProfileScreen = ({ navigation }) => {
  const route = useRoute();
  const userId = route.params?.userId;
  const [step, setStep] = useState(0);
  const [nameAnimation] = useState(new Animated.Value(0));
  const [profilePicture, setProfilePicture] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  // Updated profile data structure
  const [profileData, setProfileData] = useState({
    first_name: '',
    surname: '',
    full_name: '',
    username: '',
    gender: '',
    profile_picture_url: ''
  });

  // New nutrition profile data structure
  const [nutritionData, setNutritionData] = useState({
    allergies: [],
    goal: '',
    intensity: '',
    target_calories: 0,
    target_protein: 0,
    target_carbs: 0,
    target_fats: 0
  });

  // For the target calculation step
  const [targetFormData, setTargetFormData] = useState({
    age: '',
    height: '',
    weight: '',
    activity_level: 'moderate'
  });

  const updateField = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updateNutritionField = (field, value) => {
    setNutritionData(prev => ({ ...prev, [field]: value }));
  };

  const updateTargetField = (field, value) => {
    setTargetFormData(prev => ({ ...prev, [field]: value }));
  };



  // Field validation checks
  const isNameValid = () => {
    const namePattern = /^[A-Za-z\-]+$/;
    
    return (
      profileData.first_name.trim().length >= 2 &&
      profileData.surname.trim().length >= 2 &&
      namePattern.test(profileData.first_name.trim()) &&
      namePattern.test(profileData.surname.trim())
    );
  };
  
  const isAllergiesValid = () => {
    return (
      nutritionData.allergies === null || // Valid if "I have no allergies" is selected
      (Array.isArray(nutritionData.allergies) && nutritionData.allergies.length > 0) // Valid if allergies array is non-empty
    );
  };
    const isTargetDataValid = () => {
    return (
      targetFormData.age > 0 && 
      targetFormData.height > 0 && 
      targetFormData.weight > 0 && 
      profileData.gender !== ''
    );
  };
  const isGoalValid = () => nutritionData.goal !== '';
  const isIntensityValid = () => {
    // For "Maintain" goal, intensity is not required
    if (nutritionData.goal === 'Maintain') return true;
    return nutritionData.intensity !== '';
  };

// Handle Target Calculation Results
const handleTargetCalculation = (calculatedData) => {
  const { 
    recommendedGoal, 
    maintenance,
    weightLoss,
    bulk
  } = calculatedData;
  
  // Store all calculated targets
  const allTargets = {
    maintenance: maintenance,
    weightLoss: weightLoss,
    bulk: bulk
  };
  
  // Set the nutrition data with calculated values
  setNutritionData(prev => ({
    ...prev,
    recommendedGoal: recommendedGoal, // Set the static recommended goal
    goal: recommendedGoal, // Start with the recommended goal as the default
    target_calories: maintenance.calories,
    target_protein: maintenance.protein,
    target_carbs: maintenance.carbs,
    target_fats: maintenance.fats,
    allTargets: allTargets // Store all precomputed targets for later use
  }));
  
  // Move to the next step
  setStep(9); // Go to goal selection step
};


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

  // Validation logic for other steps
  if (step === 1 && !isNameValid()) {
    Alert.alert('Invalid Name', 'Please enter your full name');
    return;
  }


  if (step === 2 && !isAllergiesValid()) {
    Alert.alert('Invalid Selection', 'Please select your allergies or choose "I have no allergies"');
    return;
  }

  // For individual target data fields
  if (step === 3 && !profileData.gender) {
    Alert.alert('Invalid Selection', 'Please select your gender');
    return;
  }

  if (step === 4 && !targetFormData.age) {
    Alert.alert('Invalid Input', 'Please enter your age');
    return;
  }

  if (step === 5 && !targetFormData.height) {
    Alert.alert('Invalid Input', 'Please enter your height');
    return;
  }

  if (step === 6 && !targetFormData.weight) {
    Alert.alert('Invalid Input', 'Please enter your weight');
    return;
  }

  if (step === 7 && !targetFormData.activity_level) {
    Alert.alert('Invalid Selection', 'Please select your activity level');
    return;
  }


  if (step === 9 && !isGoalValid()) {
    Alert.alert('Invalid Selection', 'Please select your goal');
    return;
  }

  if (step === 10 && !isIntensityValid()) {
    Alert.alert('Invalid Selection', 'Please select your intensity level');
    return;
  }

  // Move to the next step if all validations pass
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

      // Generate a signed URL (valid for 1 year)
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



  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1); // Move to the previous step
    } else {
      Alert.alert(
        'Exit Setup',
        'Are you sure you want to exit the profile setup?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => navigation.goBack() }, // Exit the setup process
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {step > 0 && <BackButton onPress={handleBack} />}

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


{/* Step 1 - First Name and Surname */}
{step === 1 && (
  <View style={styles.inputContainer}>
    <Animated.View style={[styles.animatedView, { opacity: nameAnimation }]}>
      {/* First Name Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#9E9E9E"
          value={profileData.first_name}
          onChangeText={(text) => updateField('first_name', text)}
        />
      </View>

      {/* Surname Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Enter your surname"
          placeholderTextColor="#9E9E9E"
          value={profileData.surname}
          onChangeText={(text) => updateField('surname', text)}
        />
      </View>

      {/* Next Button */}
      <View style={styles.buttonWrapper}>
        <Button 
          title="Next" 
          onPress={() => {
            // Combine first name and surname into full_name
            const fullName = `${profileData.first_name.trim()} ${profileData.surname.trim()}`;
            updateField('full_name', fullName);
            handleNext();
          }} 
          color="#BB86FC"
          disabled={!isNameValid()}
        />
      </View>
    </Animated.View>
  </View>
)}


   {/* Step 2 - Allergies */}
{step === 2 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Select your allergies</Text>
    <View style={styles.checkboxContainer}>
      {/* Allergy Checkboxes */}
      {['Nuts', 'Seafood', 'Dairy', 'Eggs', 'Gluten'].map((allergy) => (
        <CustomCheckbox
          key={allergy}
          label={allergy}
          value={Array.isArray(nutritionData.allergies) && nutritionData.allergies.includes(allergy)} // Check if allergies is an array
          onValueChange={() => {
            if (Array.isArray(nutritionData.allergies)) {
              if (nutritionData.allergies.includes(allergy)) {
                // Remove allergy if already selected
                const newAllergies = nutritionData.allergies.filter(a => a !== allergy);
                updateNutritionField('allergies', newAllergies);
              } else {
                // Add allergy if not selected
                const newAllergies = [...nutritionData.allergies, allergy];
                updateNutritionField('allergies', newAllergies);
              }
            }
          }}
          disabled={nutritionData.allergies === null} // Disable if "I have no allergies" is selected
        />
      ))}

      {/* "I Have No Allergies" Checkbox */}
      <CustomCheckbox
        label="I have no allergies"
        value={nutritionData.allergies === null}
        onValueChange={() => {
          if (nutritionData.allergies === null) {
            // Deselect "I have no allergies" and reset allergies to an empty array
            updateNutritionField('allergies', []);
          } else {
            // Select "I have no allergies" and set allergies to null
            updateNutritionField('allergies', null);
          }
        }}
      />
    </View>
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={
          nutritionData.allergies !== null && // If allergies is not null
          Array.isArray(nutritionData.allergies) && // Ensure it's an array
          nutritionData.allergies.length === 0 // Disable if the array is empty
        }
      />
    </View>
  </View>
)}

     {/* Step 3 - Gender */}
{step === 3 && (
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
        disabled={!profileData.gender}
      />
    </View>
  </View>
)}

{/* Step 4 - Age */}
{step === 4 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>How old are you?</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        placeholderTextColor="#9E9E9E"
        value={targetFormData.age}
        onChangeText={(text) => {
          // Only allow numeric input by replacing non-numeric characters
          const numericValue = text.replace(/[^0-9]/g, '');
          updateTargetField('age', numericValue);
        }}
        keyboardType="numeric"
      />
    </View>
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={!targetFormData.age}
      />
    </View>
  </View>
)}

{/* Step 5 - Height */}
{step === 5 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>What is your height?</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder="Enter your height in cm"
        placeholderTextColor="#9E9E9E"
        value={targetFormData.height}
        onChangeText={(text) => {
          // Only allow numeric input
          const numericValue = text.replace(/[^0-9]/g, '');
          updateTargetField('height', numericValue);
        }}
        keyboardType="numeric"
      />
    </View>
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={!targetFormData.height}
      />
    </View>
  </View>
)}

{/* Step 6 - Weight */}
{step === 6 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>What is your weight?</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder="Enter your weight in kg"
        placeholderTextColor="#9E9E9E"
        value={targetFormData.weight}
        onChangeText={(text) => {
          // Only allow numeric input
          const numericValue = text.replace(/[^0-9]/g, '');
          updateTargetField('weight', numericValue);
        }}
        keyboardType="numeric"
      />
    </View>
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={!targetFormData.weight}
      />
    </View>
  </View>
)}

{/* Step 7 - Activity Level */}
{step === 7 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>What is your activity level?</Text>
    <View style={styles.activityContainer}>
      {[
        { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
        { id: 'light', label: 'Lightly Active', description: '1-3 days/week' },
        { id: 'moderate', label: 'Moderately Active', description: '3-5 days/week' },
        { id: 'active', label: 'Very Active', description: '6-7 days/week' },
        { id: 'veryActive', label: 'Extra Active', description: 'Athletes, physical jobs' }
      ].map((activity) => (
        <TouchableOpacity
          key={activity.id}
          style={[
            styles.activityButton,
            targetFormData.activity_level === activity.id && styles.activityButtonSelected
          ]}
          onPress={() => updateTargetField('activity_level', activity.id)}
        >
          <Text 
            style={[
              styles.activityButtonText,
              targetFormData.activity_level === activity.id && styles.selectedButtonText
            ]}
          >
            {activity.label}
          </Text>
          <Text 
            style={[
              styles.activityDescription,
              targetFormData.activity_level === activity.id && styles.selectedButtonText
            ]}
          >
            {activity.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={!targetFormData.activity_level}
      />
    </View>
  </View>
)}

{/* Step 8 - Calculate Button */}
{step === 8 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Let's calculate your nutrition target</Text>
    
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Your Information:</Text>
      <Text style={styles.summaryText}>Gender: {profileData.gender === 'male' ? 'Male' : 'Female'}</Text>
      <Text style={styles.summaryText}>Age: {targetFormData.age}</Text>
      <Text style={styles.summaryText}>Height: {targetFormData.height} cm</Text>
      <Text style={styles.summaryText}>Weight: {targetFormData.weight} kg</Text>
      <Text style={styles.summaryText}>Activity: {
        {
          'sedentary': 'Sedentary',
          'light': 'Lightly Active',
          'moderate': 'Moderately Active',
          'active': 'Very Active',
          'veryActive': 'Extra Active'
        }[targetFormData.activity_level]
      }</Text>
    </View>
    
    <View style={styles.buttonWrapper}>
      <Button
        title="Calculate My Target"
        onPress={() => {
          if (isTargetDataValid()) {
            // Use CalorieCalculator component to calculate
            const calculatedData = CalorieCalculator.calculate({
              gender: profileData.gender,
              age: parseInt(targetFormData.age),
              height: parseInt(targetFormData.height),
              weight: parseInt(targetFormData.weight),
              activityLevel: targetFormData.activity_level
            });
            
            handleTargetCalculation(calculatedData);
          } else {
            Alert.alert('Missing Information', 'Please fill in all fields');
          }
        }}
        color="#BB86FC"
        disabled={!isTargetDataValid()}
      />
    </View>
  </View>
)}

{/* Step 9 - Goal Confirmation */}
{step === 9 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Based on your metrics, we recommend:</Text>
    <Text style={styles.recommendedGoal}>
      {nutritionData.recommendedGoal || 'No recommendation available'}
    </Text>
    
    <Text style={styles.sublabel}>You can keep our recommendation or choose another goal:</Text>
    
    <View style={styles.checkboxContainer}>
      {['Weight Loss', 'Maintain', 'Bulk'].map((goal) => (
        <TouchableOpacity
          key={goal}
          style={[
            styles.goalsButton,
            nutritionData.goal === goal && styles.goalsButtonSelected
          ]}
          onPress={() => {
            // Update goal
            updateNutritionField('goal', goal);
            
            // Reset intensity when goal changes to ensure consistency
            updateNutritionField('intensity', '');

            // Update macros based on the selected goal
            if (goal === 'Maintain') {
              const maintenance = nutritionData.allTargets.maintenance;
              updateNutritionField('target_calories', maintenance.calories);
              updateNutritionField('target_protein', maintenance.protein);
              updateNutritionField('target_carbs', maintenance.carbs);
              updateNutritionField('target_fats', maintenance.fats);
            } else if (goal === 'Weight Loss') {
              const moderateTargets = nutritionData.allTargets.weightLoss.moderate;
              updateNutritionField('target_calories', moderateTargets.calories);
              updateNutritionField('target_protein', moderateTargets.protein);
              updateNutritionField('target_carbs', moderateTargets.carbs);
              updateNutritionField('target_fats', moderateTargets.fats);
            } else if (goal === 'Bulk') {
              const moderateTargets = nutritionData.allTargets.bulk.moderate;
              updateNutritionField('target_calories', moderateTargets.calories);
              updateNutritionField('target_protein', moderateTargets.protein);
              updateNutritionField('target_carbs', moderateTargets.carbs);
              updateNutritionField('target_fats', moderateTargets.fats);
            }
          }}
        >
          <Text style={styles.goalsButtonText}>{goal}</Text>
        </TouchableOpacity>
      ))}
    </View>
    
    <View style={styles.macroSummary}>
      <Text style={styles.macroTitle}>Your Daily Targets:</Text>
      <Text style={styles.macroText}>Calories: {nutritionData.target_calories}</Text>
      <Text style={styles.macroText}>Protein: {nutritionData.target_protein}g</Text>
      <Text style={styles.macroText}>Carbs: {nutritionData.target_carbs}g</Text>
      <Text style={styles.macroText}>Fats: {nutritionData.target_fats}g</Text>
    </View>
    
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={!isGoalValid()}
      />
    </View>
  </View>
)}

{/* Step 10 - Intensity Selection */}
{step === 10 && (
  <View style={styles.inputContainer}>
    {nutritionData.goal !== 'Maintain' ? (
      <>
        <Text style={styles.label}>
          Select your {nutritionData.goal === 'Weight Loss' ? 'deficit' : 'surplus'} intensity
        </Text>
        
        <View style={styles.intensityContainer}>
          <TouchableOpacity
            style={[
              styles.intensityButton,
              nutritionData.intensity === 'Moderate' && styles.intensityButtonSelected
            ]}
            onPress={() => {
              // Update intensity
              updateNutritionField('intensity', 'Moderate');
              
              // Use precomputed values from the appropriate target
              const goalKey = nutritionData.goal === 'Weight Loss' ? 'weightLoss' : 'bulk';
              const moderateTargets = nutritionData.allTargets[goalKey].moderate;
              
              // Update nutrition targets
              updateNutritionField('target_calories', moderateTargets.calories);
              updateNutritionField('target_protein', moderateTargets.protein);
              updateNutritionField('target_carbs', moderateTargets.carbs);
              updateNutritionField('target_fats', moderateTargets.fats);
            }}
          >
            <Text style={styles.intensityButtonText}>Moderate</Text>
            <Text style={styles.intensityDescription}>
              {nutritionData.goal === 'Weight Loss' 
                ? 'Slower, sustainable weight loss (300-500 cal deficit)'
                : 'Balanced muscle gain with minimal fat (300-500 cal surplus)'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.intensityButton,
              nutritionData.intensity === 'Intense' && styles.intensityButtonSelected
            ]}
            onPress={() => {
              // Update intensity
              updateNutritionField('intensity', 'Intense');
              
              // Use precomputed values from the appropriate target
              const goalKey = nutritionData.goal === 'Weight Loss' ? 'weightLoss' : 'bulk';
              const intenseTargets = nutritionData.allTargets[goalKey].intense;
              
              // Update nutrition targets
              updateNutritionField('target_calories', intenseTargets.calories);
              updateNutritionField('target_protein', intenseTargets.protein);
              updateNutritionField('target_carbs', intenseTargets.carbs);
              updateNutritionField('target_fats', intenseTargets.fats);
            }}
          >
            <Text style={styles.intensityButtonText}>Intense</Text>
            <Text style={styles.intensityDescription}>
              {nutritionData.goal === 'Weight Loss' 
                ? 'Faster weight loss (500-750 cal deficit)'
                : 'Maximum muscle gain (500-750 cal surplus)'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.macroSummary}>
          <Text style={styles.macroTitle}>Updated Daily Targets:</Text>
          <Text style={styles.macroText}>Calories: {nutritionData.target_calories}</Text>
          <Text style={styles.macroText}>Protein: {nutritionData.target_protein}g</Text>
          <Text style={styles.macroText}>Carbs: {nutritionData.target_carbs}g</Text>
          <Text style={styles.macroText}>Fats: {nutritionData.target_fats}g</Text>
        </View>
      </>
    ) : (
      // For maintenance, we skip intensity selection and just show targets
      <View style={styles.macroSummary}>
        <Text style={styles.label}>Your maintenance targets:</Text>
        <Text style={styles.macroText}>Calories: {nutritionData.target_calories}</Text>
        <Text style={styles.macroText}>Protein: {nutritionData.target_protein}g</Text>
        <Text style={styles.macroText}>Carbs: {nutritionData.target_carbs}g</Text>
        <Text style={styles.macroText}>Fats: {nutritionData.target_fats}g</Text>
      </View>
    )}
    
    <View style={styles.buttonWrapper}>
      <Button
        title="Next"
        onPress={handleNext}
        color="#BB86FC"
        disabled={!isIntensityValid()}
      />
    </View>
  </View>
)}


{/* Step 11 - Profile Picture */}
{step === 11 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Add a profile picture</Text>
    
    {profilePicture ? (
      <Image 
        source={{ uri: profilePicture }}
        style={styles.imagePreview} 
        resizeMode="cover"
      />
    ) : (
      <View style={styles.imagePreview} />
    )}
    
    <View style={styles.buttonWrapper}>
      <Button
        title="Choose Photo"
        onPress={pickImage}
        color="#BB86FC"
      />
    </View>
    
    <TouchableOpacity onPress={handleNext}>
      <Text style={[styles.hintText, { color: '#BB86FC', marginTop: 20 }]}>
        Skip for now
      </Text>
    </TouchableOpacity>
  </View>
)}

{/* Step 12 - Username Selection */}
{step === 12 && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Choose a username</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, !usernameAvailable && styles.inputError]}
        placeholder="Enter your username"
        placeholderTextColor="#9E9E9E"
        value={profileData.username}
        onChangeText={(text) => {
          updateField('username', text);
          setUsernameAvailable(true); // Reset availability status on change
        }}
        autoCapitalize="none"
      />
      {!usernameAvailable && (
        <Text style={styles.errorText}>Username not available. Please choose another.</Text>
      )}
    </View>
    <View style={styles.buttonWrapper}>
      <Button
        title="Complete Setup"
        onPress={async () => {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                full_name: profileData.full_name,
                username: profileData.username,
                gender: profileData.gender,
                profile_picture_url: profileData.profile_picture_url,
                profile_complete: true,
                updated_at: new Date().toISOString(),
              });
              
            if (profileError) {
              if (profileError.code === '23505' &&
                  (profileError.message.includes('profiles_username_key') ||
                   profileError.message.includes('profiles_username_lower_idx'))) {
                setUsernameAvailable(false);
                return;
              }
              throw profileError;
            }
              
            const { error: nutritionError } = await supabase
              .from('nutrition_profiles')
              .upsert({
                user_id: userId,
                allergies: nutritionData.allergies,
                goal: nutritionData.goal,
                intensity: nutritionData.intensity,
                target_calories: nutritionData.target_calories,
                target_protein: nutritionData.target_protein,
                target_carbs: nutritionData.target_carbs,
                target_fats: nutritionData.target_fats,
                updated_at: new Date().toISOString(),
              });
              
            if (nutritionError) throw nutritionError;
              
            // Let MainNavigator know the profile is complete first
            if (typeof onProfileComplete === 'function') {
              onProfileComplete();
            }
              
            // Then navigate to the Welcome screen
            navigation.navigate('Welcome');
              
          } catch (error) {
            console.error('Error completing profile:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
          }
        }}
        color="#BB86FC"
        disabled={!profileData.username.trim()} // Disable button if username is empty
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
    textAlign: 'center', 
  },
  sublabel: {
    color: '#BB86FC',
    fontSize: 14,
    marginBottom: 8,
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
  activityContainer: {
    width: '80%',
    marginBottom: 20,
  },
  activityButton: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  activityButtonSelected: {
    backgroundColor: '#BB86FC',
  },
  activityButtonText: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  activityDescription: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  selectedButtonText: {
    color: '#000000', 
  },
  intensityContainer: {
    width: '80%',
    marginBottom: 20,
  },
  intensityButton: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  intensityButtonSelected: {
    backgroundColor: '#BB86FC',
  },
  intensityButtonText: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  intensityDescription: {
    color: '#9E9E9E',
    fontSize: 12,
    textAlign: 'center',
  },
  macroSummary: {
    width: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 15,
    marginVertical: 15,
  },
  macroTitle: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  macroText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 5,
  },
  recommendedGoal: {
    color: '#BB86FC',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },

summaryContainer: {
  width: '80%',
  backgroundColor: '#1E1E1E',
  borderRadius: 20,
  padding: 15,
  marginVertical: 15,
},
summaryTitle: {
  color: '#BB86FC',
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 10,
},
summaryText: {
  color: '#E0E0E0',
  fontSize: 14,
  marginBottom: 8,
},
activityDescription: {
  color: '#9E9E9E',
  fontSize: 12,
  textAlign: 'center',
  marginTop: 4,
},
});

export default SetupProfileScreen;