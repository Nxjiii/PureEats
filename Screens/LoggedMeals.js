import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;

const LoggedMeals = () => {
  const navigation = useNavigation();

  const loggedMeals = [
    { id: '1', name: 'Breakfast', calories: 400 },
    { id: '2', name: 'Lunch', calories: 600 },
    { id: '3', name: 'Dinner', calories: 200 },
    { id: '4', name: 'Snacks', calories: 130 },
  ];

  const renderMealCard = ({ item }) => (
    <View style={styles.mealCard}>
      <View style={styles.mealContent}>
        <Text style={styles.mealText}>{item.name}</Text>
        <View style={styles.caloriesPill}>
          <Text style={styles.caloriesText}>{item.calories} kcal</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Today's Meals</Text>

      <FlatList
        data={loggedMeals}
        renderItem={renderMealCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Logger')}
      >
        <Text style={styles.addButtonText}>+ Add Food</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 80,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 120,
  },
  mealCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: CARD_MARGIN,
    padding: 0, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  mealContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  mealText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  caloriesPill: {
    backgroundColor: '#252525',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#BB86FC',
  },
  addButton: {
    backgroundColor: '#BB86FC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: CARD_MARGIN,
    marginBottom: 150,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  addButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LoggedMeals;