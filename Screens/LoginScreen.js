import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Animated } from 'react-native';
import { supabase } from '../lib/supabaseClient';

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailScale] = useState(new Animated.Value(1));
  const [passwordScale] = useState(new Animated.Value(1));

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

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        // Don't navigate manually - let the auth listener handle it
        // The navigation will happen automatically through MainNavigator
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      <Animated.View style={[styles.inputWrapper, { transform: [{ scaleX: emailScale }, { scaleY: emailScale }] }]}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          onFocus={() => animateInput(emailScale)}
          onBlur={() => resetInput(emailScale)}
        />
      </Animated.View>
      <Animated.View style={[styles.inputWrapper, { transform: [{ scaleX: passwordScale }, { scaleY: passwordScale }] }]}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => animateInput(passwordScale)}
          onBlur={() => resetInput(passwordScale)}
        />
      </Animated.View>
      <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={loading}>
        <Text style={styles.signInButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
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
  },
  input: {
    height: 40,
    backgroundColor: '#1E1E1E',
    color: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  signInButton: {
    width: '80%',
    height: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 10,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  signUpText: {
    color: '#9E9E9E',
  },
  signUpLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;