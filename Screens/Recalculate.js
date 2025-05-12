import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, SafeAreaView, StatusBar, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import CalorieCalculator from '../components/CalorieCalculator';

const ActivityLevels = [
  { label: 'Sedentary', value: 'sedentary', description: 'Little or no exercise' },
  { label: 'Light', value: 'light', description: '1-2 days/week' },
  { label: 'Moderate', value: 'moderate', description: '3-5 days/week' },
  { label: 'Active', value: 'active', description: '6-7 days/week' },
  { label: 'Very Active', value: 'veryActive', description: 'Intense daily exercise' }
];

const Goals = [
  { label: 'Weight Loss', value: 'Weight Loss' },
  { label: 'Maintain', value: 'Maintain' },
  { label: 'Bulk', value: 'Bulk' }
];

const Genders = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
];

const Intensities = [
  { label: 'Moderate', value: 'moderate' },
  { label: 'Intense', value: 'intense' }
];

const Recalculate = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [userData, setUserData] = useState({
    gender: 'other',
    age: '',
    height: '',
    weight: '',
    activityLevel: 'moderate'
  });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedIntensity, setSelectedIntensity] = useState('moderate');
  const [calculationResults, setCalculationResults] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);
    };
    getUserId();
  }, []);

  const handleCalculate = () => {
    if (!userData.age || isNaN(userData.age) || !userData.height || isNaN(userData.height) || !userData.weight || isNaN(userData.weight)) {
      Alert.alert('Invalid Input', 'Please ensure all fields are filled with valid numbers.');
      return;
    }

    setCalculating(true);

    const userDataForCalc = {
      gender: userData.gender,
      age: parseFloat(userData.age),
      height: parseFloat(userData.height),
      weight: parseFloat(userData.weight),
      activityLevel: userData.activityLevel,
    };

    try {
      const results = CalorieCalculator.calculate(userDataForCalc);
      setCalculationResults(results);
      setSelectedGoal(results.recommendedGoal);
    } catch (error) {
      console.error('Calculation error:', error);
      Alert.alert('Error', 'Failed to calculate nutrition targets.');
    } finally {
      setCalculating(false);
    }
  };

  const getSelectedPlan = () => {
    if (!calculationResults || !selectedGoal) return null;

    if (selectedGoal === 'Maintain') {
      return calculationResults.maintenance;
    } else if (selectedGoal === 'Weight Loss') {
      return calculationResults.weightLoss[selectedIntensity];
    } else if (selectedGoal === 'Bulk') {
      return calculationResults.bulk[selectedIntensity];
    }

    return null;
  };

  const handleSave = async () => {
    const selectedPlan = getSelectedPlan();
    if (!selectedPlan) {
      Alert.alert('Error', 'No selected plan found. Please calculate your targets first.');
      return;
    }

    setSaveLoading(true);
    try {
      await supabase
        .from('nutrition_profiles')
        .update({
          goal: selectedGoal, 
          intensity: selectedGoal !== 'Maintain' ? selectedIntensity : null, 
          target_calories: selectedPlan.calories,
          target_protein: selectedPlan.protein,
          target_carbs: selectedPlan.carbs,
          target_fats: selectedPlan.fats,
        })
        .eq('user_id', userId);

      Alert.alert('Success', 'Your new nutrition targets have been saved.');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving nutrition targets:', error);
      Alert.alert('Error', 'Failed to save nutrition targets. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recalculate Nutrition</Text>
        </View>

        {/* User Details Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Details</Text>
          <View style={styles.card}>
            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                {Genders.map((gender) => (
                  <TouchableOpacity
                    key={gender.value}
                    style={[
                      styles.genderOption,
                      userData.gender === gender.value && styles.genderOptionSelected
                    ]}
                    onPress={() => setUserData({ ...userData, gender: gender.value })}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      userData.gender === gender.value && styles.genderOptionTextSelected
                    ]}>
                      {gender.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.spacer} />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={userData.age}
                onChangeText={(text) => setUserData({ ...userData, age: text })}
                placeholder="Enter your age"
                placeholderTextColor="#6D6D6D"
                keyboardType="numeric"
                selectionColor="#BB86FC"
              />
            </View>
            
            <View style={styles.spacer} />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={userData.height}
                onChangeText={(text) => setUserData({ ...userData, height: text })}
                placeholder="Enter your height in cm"
                placeholderTextColor="#6D6D6D"
                keyboardType="numeric"
                selectionColor="#BB86FC"
              />
            </View>
            
            <View style={styles.spacer} />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={userData.weight}
                onChangeText={(text) => setUserData({ ...userData, weight: text })}
                placeholder="Enter your weight in kg"
                placeholderTextColor="#6D6D6D"
                keyboardType="numeric"
                selectionColor="#BB86FC"
              />
            </View>
            
            <View style={styles.spacer} />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level</Text>
              <View style={styles.activityContainer}>
                {ActivityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.activityOption,
                      userData.activityLevel === level.value && styles.activityOptionSelected
                    ]}
                    onPress={() => setUserData({ ...userData, activityLevel: level.value })}
                  >
                    <Text style={[
                      styles.activityOptionText,
                      userData.activityLevel === level.value && styles.activityOptionTextSelected
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={styles.activityDescription}>{level.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.calculateButton} 
              onPress={handleCalculate}
              disabled={calculating}
            >
              {calculating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.calculateButtonText}>Calculate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {calculationResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results</Text>
            <View style={styles.card}>
              <Text style={styles.recommendationText}>
                Recommended Goal: <Text style={styles.highlightText}>{calculationResults.recommendedGoal}</Text>
              </Text>
              
              <View style={styles.spacer} />
              
              <Text style={styles.inputLabel}>Select Goal</Text>
              <View style={styles.goalContainer}>
                {Goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.value}
                    style={[
                      styles.goalOption,
                      selectedGoal === goal.value && styles.goalOptionSelected,
                      calculationResults.recommendedGoal === goal.value && styles.goalOptionRecommended
                    ]}
                    onPress={() => setSelectedGoal(goal.value)}
                  >
                    <Text style={[
                      styles.goalOptionText,
                      selectedGoal === goal.value && styles.goalOptionTextSelected
                    ]}>
                      {goal.label}
                    </Text>
                    {calculationResults.recommendedGoal === goal.value && (
                      <Text style={styles.recommendedTag}>Recommended</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedGoal && selectedGoal !== 'Maintain' && (
                <>
                  <View style={styles.spacer} />
                  <Text style={styles.inputLabel}>Select Intensity</Text>
                  <View style={styles.intensityContainer}>
                    {Intensities.map((intensity) => (
                      <TouchableOpacity
                        key={intensity.value}
                        style={[
                          styles.intensityOption,
                          selectedIntensity === intensity.value && styles.intensityOptionSelected
                        ]}
                        onPress={() => setSelectedIntensity(intensity.value)}
                      >
                        <Text style={[
                          styles.intensityOptionText,
                          selectedIntensity === intensity.value && styles.intensityOptionTextSelected
                        ]}>
                          {intensity.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              
              {selectedGoal && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.macrosResult}>
                    <Text style={styles.resultTitle}>New Nutrition Targets</Text>
                    
                    {(() => {
                      const selectedPlan = getSelectedPlan();
                      console.log('Selected Plan:', selectedPlan);

                      if (selectedPlan) {
                        return (
                          <View style={styles.macrosGrid}>
                            <View style={styles.macroItem}>
                              <Text style={styles.macroValue}>{selectedPlan.calories || 0}</Text>
                              <Text style={styles.macroLabel}>Calories</Text>
                            </View>
                            <View style={styles.macroItem}>
                              <Text style={styles.macroValue}>{selectedPlan.protein || 0}g</Text>
                              <Text style={styles.macroLabel}>Protein</Text>
                            </View>
                            <View style={styles.macroItem}>
                              <Text style={styles.macroValue}>{selectedPlan.carbs || 0}g</Text>
                              <Text style={styles.macroLabel}>Carbs</Text>
                            </View>
                            <View style={styles.macroItem}>
                              <Text style={styles.macroValue}>{selectedPlan.fats || 0}g</Text>
                              <Text style={styles.macroLabel}>Fats</Text>
                            </View>
                          </View>
                        );
                      }
                    })()}
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {calculationResults && selectedGoal && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save New Targets</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
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
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  genderOptionSelected: {
    borderColor: '#BB86FC',
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
  },
  genderOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: '#BB86FC',
    fontWeight: '600',
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
  activityContainer: {
    marginBottom: 8,
  },
  activityOption: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  activityOptionSelected: {
    borderColor: '#BB86FC',
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
  },
  activityOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  activityOptionTextSelected: {
    color: '#BB86FC',
    fontWeight: '600',
  },
  activityDescription: {
    color: '#A0A0A0',
    fontSize: 13,
    marginTop: 4,
  },
  calculateButton: {
    backgroundColor: '#BB86FC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#BB86FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  highlightText: {
    color: '#BB86FC',
    fontWeight: '600',
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalOption: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  goalOptionSelected: {
    borderColor: '#BB86FC',
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
  },
  goalOptionRecommended: {
    borderColor: '#03DAC6',
  },
  goalOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  goalOptionTextSelected: {
    color: '#BB86FC',
    fontWeight: '600',
  },
  recommendedTag: {
    color: '#03DAC6',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  intensityOption: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  intensityOptionSelected: {
    borderColor: '#BB86FC',
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
  },
  intensityOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  intensityOptionTextSelected: {
    color: '#BB86FC',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 24,
  },
  macrosResult: {
    marginBottom: 10,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  macroValue: {
    color: '#BB86FC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  macroLabel: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 8,
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
});

export default Recalculate;