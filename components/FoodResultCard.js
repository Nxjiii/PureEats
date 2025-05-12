import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const FoodResultCard = ({ food, onLog }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{food.name}</Text>

      <TouchableOpacity onPress={onLog} style={styles.logButton}>
        <Text style={styles.logText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  logButton: {
    backgroundColor: '#00ff99',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  logText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default FoodResultCard;
