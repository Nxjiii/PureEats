import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const SelectMeal = () => {
  const navigation = useNavigation();

  const renderMealCard = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate('Search', { mealType: item })}
    >
      <View style={styles.mealContent}>
        <Text style={styles.mealText}>{item}</Text>
        <View style={styles.plusButton}>
          <Text style={styles.plusText}>+</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Choose Meal Type</Text>

      <FlatList
        data={mealTypes}
        renderItem={renderMealCard}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  plusButton: {
    backgroundColor: '#BB86FC',
    borderRadius: 20,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    color: '#121212',
    fontSize: 20,
    fontWeight: '700',
  },
  
});

export default SelectMeal;
