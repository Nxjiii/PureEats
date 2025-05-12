import React, { useState } from 'react';
import {  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useNavigation } from '@react-navigation/native';


const Welcome = ({ navigation }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);


  const handleEnterApp = () => {
    console.log(navigation.getState()); 

    navigation.navigate('Main');
      };
  
  
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.welcomeTitle}>Welcome to PureEats!</Text>
      <Text style={styles.welcomeText}>
        Your personal nutrition and health companion is ready to help you achieve your goals.
      </Text>
      <Text style={styles.welcomeText}>
        In the next few screens, we'll introduce you to the key features of the app and how to get started.
      </Text>
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.welcomeTitle}>Terms and Conditions</Text>
      <ScrollView style={styles.termsContainer}>
      <Text style={styles.termsText}>
  By using PureEats, you agree to the following terms and conditions:

  1. **PRIVACY**: We collect minimal data necessary to provide our services. Your personal and nutrition data is stored securely and will not be shared with third parties without your explicit consent, except where required by law.

  2. **USER DATA**: You retain full ownership of your data. We use your data solely to provide and enhance our services, including nutrition tracking, recommendations, and personalized experiences.

  3. **HEALTH DISCLAIMER**: PureEats offers general nutritional guidance and is not intended to replace professional medical advice. Always consult with healthcare professionals before making significant changes to your diet or health routine.

  4. **SERVICE AVAILABILITY**: We aim to maintain uninterrupted service but cannot guarantee 100% availability. We are not liable for service interruptions due to unforeseen technical issues or maintenance.

  5. **ACCOUNT RESPONSIBILITY**: You are responsible for maintaining the confidentiality of your account credentials and any activities that occur under your account. Notify us immediately if you suspect unauthorized access.

  6. **MINIMUM AGE REQUIREMENT**: By using PureEats, you confirm that you are at least 16 years old. If you are under 16, you must have the consent of a parent or guardian to use this service. We may request proof of age to verify compliance.

  7. **MODIFICATION OF TERMS**: We reserve the right to modify these terms at any time. Any changes will be communicated to you, and continued use of PureEats after such modifications indicates acceptance of the updated terms.

  8. **GOVERNING LAW**: These terms are governed by the laws of the jurisdiction in which PureEats operates. Any disputes will be resolved in the appropriate courts of that jurisdiction.
</Text>

      </ScrollView>
      
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]} />
        <Text style={styles.checkboxLabel}>
          I have read and agree to the Terms and Conditions
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.nextButton, !termsAccepted && styles.buttonDisabled]}
          disabled={!termsAccepted}
          onPress={() => setCurrentStep(3)}
        >
          <Text style={styles.buttonText}>I Agree</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.welcomeTitle}>You're All Set!</Text>
      <Text style={styles.welcomeText}>
        Your profile is complete and you're ready to start your nutrition journey with PureEats.
      </Text>
      <Text style={styles.welcomeText}>
        • Track your meals with our easy logging system
        • Monitor your nutritional goals
        • Discover new recipes tailored to your preferences
        • Stay on track with personalised insights
      </Text>
      <TouchableOpacity 
        style={styles.enterButton}
        onPress={handleEnterApp}
      >
        <Text style={styles.buttonText}>Enter App</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      
      {/* Step indicator */}
      <View style={styles.stepIndicatorContainer}>
        {[1, 2, 3].map(step => (
          <View 
            key={step}
            style={[
              styles.stepDot,
              currentStep === step && styles.activeDot
            ]} 
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#BB86FC',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  termsContainer: {
    maxHeight: 300,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#BB86FC',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#BB86FC',
  },
  checkboxLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#BB86FC',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#BB86FC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  enterButton: {
    backgroundColor: '#BB86FC',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButtonText: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333333',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#BB86FC',
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  debugButton: {
    backgroundColor: '#ff3b30',  
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
});

export default Welcome;