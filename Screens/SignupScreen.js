import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Animated } from 'react-native';
import { supabase } from '../lib/supabaseClient';

function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [emailScale] = useState(new Animated.Value(1));
  const [passwordScale] = useState(new Animated.Value(1));
  const [confirmPasswordScale] = useState(new Animated.Value(1));
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const animateInput = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 1.05,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const resetInput = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };



  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordsMatch(text === confirmPassword);
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setPasswordsMatch(text === password);
  };

  // Function to handle signup process
  const handleSignup = async () => {
    setLoading(true);
    setErrorMessage('');
    
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            isNewUser: true
          }
        }
      });
      
      if (error) {
        setErrorMessage(error.message);
      } else if (data.user && !data.user.identities?.length) {
        setErrorMessage('This email is already registered. Please try logging in instead.');
      } else if (data.user) {
        setSignupComplete(true);
      } else {
        setErrorMessage('Signup failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async () => {
    setConfirmLoading(true);
    try {
      // Attempt to sign in with the provided detials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            "Not Confirmed Yet",
            "Please check your email and click the confirmation link before continuing.",
            [{ text: "OK" }]
          );
        } else {
          setErrorMessage(error.message);
        }
      } else {
        // Successfully signed in, which means the email was confirmed
      }
    } catch (error) {
      setErrorMessage('Failed to verify confirmation status. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      
      
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      


      {/* Email Input */} 

      {!signupComplete ? (
        <>
          <Animated.View style={[styles.inputWrapper, { transform: [{ scaleX: emailScale }, { scaleY: emailScale }] }]}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => animateInput(emailScale)}
              onBlur={() => resetInput(emailScale)}
            />
          </Animated.View>



          
          {/* Password Input */}
          <Animated.View style={[styles.inputWrapper, { transform: [{ scaleX: passwordScale }, { scaleY: passwordScale }] }]}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
              autoCapitalize="none"
              onFocus={() => animateInput(passwordScale)}
              onBlur={() => resetInput(passwordScale)}
            />
          </Animated.View>
          



        {/* Confirm Password Input */}
          <Animated.View style={[styles.inputWrapper, { 
            transform: [{ scaleX: confirmPasswordScale }, { scaleY: confirmPasswordScale }],
            borderColor: confirmPassword && passwordsMatch ? '#4CAF50' : '#1E1E1E',
            borderWidth: 1,
            borderRadius: 20
          }]}>
            <TextInput
              style={[styles.input, { paddingHorizontal: 8 }]}
              placeholder="Confirm Password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              autoCapitalize="none"
              onFocus={() => animateInput(confirmPasswordScale)}
              onBlur={() => resetInput(confirmPasswordScale)}
            />
          </Animated.View>



           {/* Password Matching Indicator */}
           {confirmPassword.length > 0 && passwordsMatch && (
            <Text style={styles.matchText}>Passwords match</Text>
          )}




           {/* Sign up button */}
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={handleSignup}
            disabled={loading || (password !== confirmPassword)}
          >
            {loading ? (
              <Text style={styles.signUpButtonText}>Signing Up...</Text>
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.returnToLoginText}>Return to Login</Text>
          </TouchableOpacity>
        </>
    

      ) : (
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>
            We've sent a confirmation email to:
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.instructionText}>
            Please check your inbox and click the confirmation link.
          </Text>
          
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirmation}
            disabled={confirmLoading}
          >
            {confirmLoading ? (
              <Text style={styles.confirmButtonText}>Verifying...</Text>
            ) : (
              <Text style={styles.confirmButtonText}>I've confirmed my email</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.returnToLoginText}>Return to Login</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 30,
  },
  inputWrapper: {
    width: '80%',
    marginBottom: 15,
    borderRadius: 20,
  },
  input: {
    height: 40,
    backgroundColor: '#1E1E1E',
    color: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  signUpButton: {
    width: '30%',
    height: 40,
    backgroundColor: '#1E1E1E', 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 15, 
  },
  signUpButtonText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  returnToLoginText: {
    color: '#9E9E9E', 
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  errorMessage: {
    color: 'red',
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
  matchText: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },

});

export default SignupScreen;