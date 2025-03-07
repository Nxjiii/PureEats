import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SetupProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your profile</Text>
    </View>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Background color
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#E0E0E0', // Primary text color
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SetupProfileScreen;
