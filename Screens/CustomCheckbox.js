import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const CustomCheckbox = ({ value, onValueChange, label }) => {
  return (
    <TouchableOpacity 
      style={styles.checkboxContainer}
      onPress={() => onValueChange(!value)}
    >
      <View 
        style={[
          styles.checkbox, 
          value ? styles.checkboxSelected : styles.checkboxUnselected
        ]}
      >
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2
  },
  checkboxUnselected: {
    borderColor: '#9E9E9E',
    backgroundColor: 'transparent'
  },
  checkboxSelected: {
    borderColor: '#BB86FC',
    backgroundColor: '#BB86FC'
  },
  checkmark: {
    color: 'white',
    fontSize: 16
  },
  label: {
    color: '#E0E0E0',
    fontSize: 16
  }
});

export default CustomCheckbox;