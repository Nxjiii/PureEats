import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// Card component to display individual food result and log button
const FoodResultCard = ({ food, onLog }) => {
  return (
    <View style={styles.card}>
      {/* Text section */}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.nutrition}>
          {food.calories} kcal • {food.protein}g protein • {food.fat}g fat • {food.carbs}g carbs
        </Text>
        <Text style={styles.serving}>Serving: {food.servingSize}</Text>
      </View>

      {/*image if available */}
      {food.image && (
        <Image
          source={{ uri: food.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Log button */}
      <TouchableOpacity onPress={onLog} style={styles.logButton}>
        <Text style={styles.logText}>Log</Text>
      </TouchableOpacity>
    </View>
  );
};

// Card styling
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nutrition: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  serving: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginLeft: 10,
  },
  logButton: {
    backgroundColor: '#00ff99',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  logText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default FoodResultCard;
