import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BackButton = ({ onPress }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      onPress={onPress || (() => navigation.goBack())} // Use custom logic if provided, otherwise go back
      style={styles.button}
    >
      <Text style={styles.text}>←</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginLeft: 10,
  },
  text: {
    fontSize: 20,
    color: '#BB86FC',
  },
});

export default BackButton;