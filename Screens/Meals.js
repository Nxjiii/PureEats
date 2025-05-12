import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const Meals = () => {
  const navigation = useNavigation();
  const [Meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        .select('meal_type, calories')
        .eq('user_id', user.id)
        .eq('log_date', today);

      if (error) {
        console.error('Error fetching logs:', error.message);
        setLoading(false);
        return;
      }

      // Sum calories per meal_type
      const grouped = mealTypes.map((type) => {
        const total = data
          .filter((item) => item.meal_type === type)
          .reduce((sum, item) => sum + (item.calories || 0), 0);
        return { id: type, name: type, calories: total };
      });

      setMeals(grouped);
      setLoading(false);
    };

    fetchMeals();
  }, []);

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
      <Text style={styles.headerTitle}>Today's Meals</Text>

      <FlatList
        data={Meals}
        renderItem={renderMealCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('SelectMeal')}
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

export default Meals;
