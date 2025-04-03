import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;

const LoggedMeals = () => {
  const navigation = useNavigation();

  const loggedMeals = [
    { id: '1', name: 'Breakfast', calories: 400 },
    { id: '2', name: 'Lunch', calories: 600 },
    { id: '3', name: 'Dinner', calories: 200 },
  ];

  const renderMealCard = ({ item }) => (
    <View style={styles.mealCard}>
      <Text style={styles.mealText}>{item.name}</Text>
      <Text style={styles.caloriesText}>{item.calories} kcal</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Logged Meals</Text>

      {/* Logged Meals List */}
      <FlatList
        data={loggedMeals}
        renderItem={renderMealCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: CARD_MARGIN }}
      />

      {/* Add Food Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Logger')} // Navigate to the food logging page
      >
        <Text style={styles.addButtonText}>Add Food</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 180,
    textAlign: 'center',
  },
  mealCard: {
    width: width - CARD_MARGIN * 2,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 30,
  },
  mealText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  caloriesText: {
    fontSize: 14,
    color: '#B0B0B0',
    right: -290,
  },

  addButton: {
    backgroundColor: '#BB86FC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '80%', 
    alignSelf: 'center',
    marginBottom: 180,
  },
  
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoggedMeals;
