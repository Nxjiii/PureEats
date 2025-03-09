import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabaseClient';

function UpdatePassword({ navigation, route }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = route.params;

  // On mount, check if there's an active session or use the token to authenticate.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (token) {
          // Use the token to authenticate the session
          console.log('Authenticating session with token:', token);
          const { error } = await supabase.auth.setSession({ access_token: token });
          if (error) {
            console.error('Session authentication error:', error);
            Alert.alert(
              "Session Error",
              "Failed to authenticate session. Please reset your password again.",
              [{ text: "OK", onPress: () => navigation.navigate('Login') }]
            );
          }
        } else {
          Alert.alert(
            "Session Error",
            "No active session found. Please reset your password again.",
            [{ text: "OK", onPress: () => navigation.navigate('Login') }]
          );
        }
      }
    };
    checkSession();
  }, [navigation, token]);

  const handleUpdatePassword = async () => {
    // Validate inputs
    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      // Update the password for the current user session
      console.log('Updating password...');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('Password update error:', error);
        setMessage(error.message);
      } else {
        setMessage('Password updated successfully.');
        // After a short delay, navigate to the main app flow
        setTimeout(() => {
          navigation.navigate('Main');
        }, 1500);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Update Password</Text>
      
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword} disabled={loading}>
        <Text style={styles.updateButtonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
      </TouchableOpacity>

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
  updateButton: {
    width: '80%',
    height: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 10,
  },
  updateButtonText: {
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
});

export default UpdatePassword;
