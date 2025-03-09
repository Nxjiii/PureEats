import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { supabase } from '../lib/supabaseClient';

function ResetPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Handle initial URL and deep links
  useEffect(() => {
    // Check for deep links when component mounts
    const checkForDeepLinks = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          handleDeepLink(url);
        }
      } catch (error) {
        console.error('Error checking initial URL:', error);
      }
    };

    // Handle URL deep link 
    const handleDeepLink = (url) => {
      console.log('Handling deep link in ResetPassword:', url);
      
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        // Extract token from URL
        const params = new URLSearchParams(url.split('?')[1]);
        const token = params.get('token') || params.get('access_token');
        
        if (token) {
          console.log('Found token in URL, navigating to UpdatePassword');
          navigation.navigate('UpdatePassword', { token });
        } else {
          Alert.alert('No token found', 'Please ensure you have clicked the link correctly.');
        }
      }
    };

    checkForDeepLinks();

    // Set up event listener for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage('');

    if (!email) {
      setMessage('Please enter your email.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myapp://reset-password',  // The redirect URL after resetting password
      });

      if (error) {
        setMessage(error.message);
      } else {
        setResetSent(true);
        setMessage('Password reset link sent. Check your email.');
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fallback function when the user taps "I've clicked the link"
  const handleConfirmation = async () => {
    try {
      const url = await Linking.getInitialURL();
      console.log('Current URL when confirming reset:', url);
      
      if (url && (url.includes('reset-password') || url.includes('type=recovery'))) {
        const params = new URLSearchParams(url.split('?')[1]);
        const token = params.get('token') || params.get('access_token');
        
        if (token) {
          navigation.navigate('UpdatePassword', { token });
        } else {
          Alert.alert("No token found", "We didn't detect a token. Please ensure you've clicked the link in your email.");
        }
      } else {
        Alert.alert(
          "No deep link detected", 
          "Please open the reset link from your email. If you've already clicked the link, try clicking it again.",
          [
            { 
              text: "Go to Email App", 
              onPress: () => Linking.openURL('mailto:') 
            },
            { text: "OK" }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling confirmation:', error);
      Alert.alert('Error', 'There was a problem processing your request.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {!resetSent ? (
        <>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} disabled={loading}>
            <Text style={styles.resetButtonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>We've sent a password reset link to:</Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.instructionText}>Please check your email and click the link to proceed.</Text>
          
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmation}>
            <Text style={styles.confirmButtonText}>I've clicked the link</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.goBackText}>Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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
    marginBottom: 20,
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
    paddingHorizontal: 10,
  },
  resetButton: {
    width: '80%',
    height: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  goBackText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 10,
  },
  message: {
    color: '#BB86FC',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmationContainer: {
    width: '80%',
    alignItems: 'center',
  },
  confirmationText: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  emailText: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  instructionText: {
    color: '#9E9E9E',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
  },
  confirmButton: {
    width: '80%',
    height: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 15,
  },
  confirmButtonText: {
    color: '#BB86FC',
    fontSize: 16,
  },
});

export default ResetPassword;