import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MetricRingCard from '../components/MetricRingCard';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

function Logger() {
  const navigation = useNavigation();
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [Meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [goals, setGoals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  // Fetch user's goals when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchGoals = async () => {
        setLoadingGoals(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
        if (sessionError || !session?.user) {
          console.error('Session error:', sessionError);
          setLoadingGoals(false);
          return;
        }
    
        const { data, error } = await supabase
        .from('nutrition_profiles')
        .select('target_calories, target_protein, target_carbs, target_fats')
          .eq('user_id', session.user.id)
          .single();
    
        if (error) {
          console.error('Failed to fetch goals:', error.message);
        } else if (data) {
          setGoals({
            calories: data.target_calories,
            protein: data.target_protein,
            carbs: data.target_carbs,
            fats: data.target_fats,
          });
        }
    
        setLoadingGoals(false);
      };
  
      fetchGoals();
    }, [])
  );

  // Fetch logged meals when the screen is focused and calculate totals
  useFocusEffect(
    React.useCallback(() => {
      const fetchMeals = async () => {
        setLoading(true);
  
        const { data: { user }, error: userError } = await supabase.auth.getUser();
  
        if (userError || !user) {
          console.error('User not authenticated', userError);
          setLoading(false);
          return;
        }
  
        const today = new Date().toISOString().split('T')[0];
  
        const { data, error } = await supabase
          .from('nutrition_logs')
          .select('meal_type, calories, protein, carbs, fats')
          .eq('user_id', user.id)
          .eq('log_date', today);
  
        if (error) {
          console.error('Error fetching logs:', error.message);
          setLoading(false);
          return;
        }
  
        // Sum calories, protein, carbs, and fats per meal_type
        const grouped = mealTypes.map((type) => {
          const totalCalories = data.filter((item) => item.meal_type === type)
                                    .reduce((sum, item) => sum + (item.calories || 0), 0);
          const totalProtein = data.filter((item) => item.meal_type === type)
                                   .reduce((sum, item) => sum + (item.protein || 0), 0);
          const totalCarbs = data.filter((item) => item.meal_type === type)
                                  .reduce((sum, item) => sum + (item.carbs || 0), 0);
          const totalFats = data.filter((item) => item.meal_type === type)
                                 .reduce((sum, item) => sum + (item.fats || 0), 0);

          return { id: type, name: type, calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fats: totalFats };
        });
  
        setMeals(grouped);
        setLoading(false);
  
        // Calculate total macros for the day
        const totalCalories = data.reduce((sum, item) => sum + (item.calories || 0), 0);
        const totalProtein = data.reduce((sum, item) => sum + (item.protein || 0), 0);
        const totalCarbs = data.reduce((sum, item) => sum + (item.carbs || 0), 0);
        const totalFats = data.reduce((sum, item) => sum + (item.fats || 0), 0);

        setTotals({
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein),
          carbs: Math.round(totalCarbs),
          fats: Math.round(totalFats),
        });
      };
  
      fetchMeals();
    }, [])
  );

  // Recently searched foods (replaced with data later)
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

  // Render meal cards for logged meals
  const renderMealCard = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate('LoggedFoods', { mealType: item.name })}
    >
      <View style={styles.mealContent}>
        <Text style={styles.mealText}>{item.name}</Text>
        <View style={styles.caloriesPill}>
          <Text style={styles.caloriesText}>{item.calories} kcal</Text>
        </View>
      </View>
    </TouchableOpacity>
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
            size="small"
            onPress={() => navigation.navigate('Meals')} 
          />
          <MetricRingCard
            label="Protein"
            value={totals.protein}
            goal={goals.protein}
            unit="g"
            size="small"
            onPress={() => navigation.navigate('Meals')}
          />
          <MetricRingCard
            label="Carbs"
            value={totals.carbs}
            goal={goals.carbs}
            unit="g"
            size="small"
            onPress={() => navigation.navigate('Meals')}
          />
          <MetricRingCard
            label="Fats"
            value={totals.fats}
            goal={goals.fats}
            unit="g"
            size="small"
            onPress={() => navigation.navigate('Meals')}
          />
        </View>

        {/* LOG FOOD SECTION */}
        <View style={styles.logSection}>
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => navigation.navigate('SelectMeal')}>
            <Text style={styles.logButtonText}>Add Food</Text>
          </TouchableOpacity>

          {/* RECENTLY SEARCHED FOODS */}
          <Text style={styles.recentTitle}>Recently Searched</Text>
          <FlatList
            data={recentlySearchedFoods}
            horizontal
            renderItem={renderFoodCard}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            style={styles.recentList}
          />
        </View>
        
        {/* LOGGED MEALS SECTION */}
        <View style={styles.MealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Meals')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator color="#BB86FC" style={styles.loader} />
          ) : (
            <View style={styles.mealsContainer}>
              {Meals.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={styles.mealCard}
                  onPress={() => navigation.navigate('LoggedFoods', { mealType: meal.name })}
                >
                  <View style={styles.mealContent}>
                    <Text style={styles.mealText}>{meal.name}</Text>
                    <View style={styles.caloriesPill}>
                      <Text style={styles.caloriesText}>{meal.calories} kcal</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


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
    marginBottom: 30,
    textAlign: 'center',
  },
  metricsRow: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  logSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  recentList: {
    marginBottom: 8,
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
  
  // Logged Meals Section
  MealsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    color: '#BB86FC',
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  mealsContainer: {
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  mealContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  mealText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  caloriesPill: {
    backgroundColor: '#252525',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  caloriesText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#BB86FC',
  },
});

export default Logger;
