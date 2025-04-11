import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MetricRingCard from '../components/MetricRingCard'; // progress ring component

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;

function Logger(){
  const navigation = useNavigation();

  // Placeholder total nutrients (normally fetched from API)
  const totals = {
    calories: 1200,
    protein: 90,
    carbs: 160,
    fat: 50,
  };

  // Placeholder daily goals (normally from user profile or settings)
  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  };

  // Recently searched foods (replaced with user-specific data later)
  const recentlySearchedFoods = [
    { id: '1', name: 'Chicken Breast' },
    { id: '2', name: 'Oatmeal' },
    { id: '3', name: 'Greek Yogurt' },
    { id: '4', name: 'Banana' },
  ];

  const renderFoodCard = ({ item }) => (
    <View style={styles.foodCard}>
      <Text style={styles.foodText}>{item.name}</Text>
      <TouchableOpacity style={styles.quickAddButton}>
        <Text style={styles.quickAddText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* METRIC RINGS */}
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.metricsRow}>
          <MetricRingCard
            label="Calories"
            value={totals.calories}
            goal={goals.calories}
            unit="kcal"
            onPress={() => navigation.navigate('LoggedMeals')} //  Goes to logged meals screen
          />
          <MetricRingCard label="Protein" value={totals.protein} goal={goals.protein} unit="g" />
          <MetricRingCard label="Carbs" value={totals.carbs} goal={goals.carbs} unit="g" />
          <MetricRingCard label="Fat" value={totals.fat} goal={goals.fat} unit="g" />
        </View>

        {/* LOG FOOD SECTION */}
        <View style={styles.logSection}>
          <TouchableOpacity style={styles.logButton}>
            <Text style={styles.logButtonText}>Log Food</Text>
          </TouchableOpacity>

          {/* RECENTLY SEARCHED FOODS */}
          <Text style={styles.recentTitle}>Recently Searched</Text>
          <FlatList
            data={recentlySearchedFoods}
            horizontal
            renderItem={renderFoodCard}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: CARD_MARGIN }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  logSection: {
    paddingHorizontal: 20,
  },
  logButton: {
    backgroundColor: '#BB86FC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recentTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  foodCard: {
    width: 140,
    height: 80,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    marginRight: 12,
    flexDirection: 'column',
  },
  foodText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  quickAddButton: {
    backgroundColor: '#2a9d8f',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  quickAddText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default Logger;
