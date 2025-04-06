import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BackButton = () => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity 
      onPress={() => navigation.goBack()} 
      style={{ padding: 10 }}
    >
      <Text style={{ fontSize: 20, color: '#BB86FC' }}>←</Text>
    </TouchableOpacity>
  );
};

export default BackButton;