import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, FlatList, Dimensions, TouchableOpacity,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MetricRingCard from '../components/MetricRingCard'; 
import { Session } from '@supabase/supabase-js'; 



function HomeScreen() {
  const navigation = useNavigation();
  const [loadingGoals, setLoadingGoals] = useState(true);


const [goals, setGoals] = useState({
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 70,
});

//temportary hardcoded values
const totals = {
  calories: 1200,
  protein: 90,
  carbs: 160,
  fat: 50,
};


useEffect(() => {
  const fetchGoals = async () => {
    setLoadingGoals(true);
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

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
        fat: data.target_fats,
      });
    }

    setLoadingGoals(false);
  };

  fetchGoals();
}, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* METRIC RINGS */}
        <Text style={styles.sectionTitle}>Home</Text>
        
        <TouchableOpacity 
          style={styles.metricsContainer} 
          onPress={() => navigation.navigate('Logger')}
          activeOpacity={0.9}
        >
     <View style={styles.metricsRow}>
  <MetricRingCard
    label="Calories"
    value={totals.calories}
    goal={goals.calories}
    unit="kcal"
    size="small"
    onPress={() => navigation.navigate('LoggedMeals')} 
  />
  <MetricRingCard
    label="Protein"
    value={totals.protein}
    goal={goals.protein}
    unit="g"
    size="small"
    onPress={() => navigation.navigate('LoggedMeals')}
  />
  <MetricRingCard
    label="Carbs"
    value={totals.carbs}
    goal={goals.carbs}
    unit="g"
    size="small"
    onPress={() => navigation.navigate('LoggedMeals')}
  />
  <MetricRingCard
    label="Fat"
    value={totals.fat}
    goal={goals.fat}
    unit="g"
    size="small"
    onPress={() => navigation.navigate('LoggedMeals')}
  />
</View>

          
          <View style={styles.loggerPrompt}>
            <Text style={styles.loggerText}>Track Your Progress!</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 50,
    textAlign: 'center',
  },
  metricsContainer: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  loggerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 8,
  },
  loggerText: {
    color: '#999',
    fontSize: 14,
  }
});

export default HomeScreen;