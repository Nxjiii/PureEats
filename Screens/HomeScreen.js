import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import MetricRingCard from '../components/MetricRingCard';
import AsyncStorage from '@react-native-async-storage/async-storage';


function HomeScreen() {
  const navigation = useNavigation();
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const [goals, setGoals] = useState({   
    calories: 0, 
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [featuredRecipe, setFeaturedRecipe] = useState(null);

  // Fetch user's goals when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchGoalsAndData = async () => {
        setLoadingGoals(true);
        setLoadingData(true);

        // Get session to identify user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error('Session error:', sessionError);
          setLoadingGoals(false);
          setLoadingData(false);
          return;
        }

        // Fetch user's target goals from 'nutrition_profiles'
        const { data: goalData, error: goalError } = await supabase
          .from('nutrition_profiles')
          .select('target_calories, target_protein, target_carbs, target_fats')
          .eq('user_id', session.user.id)
          .single();

        if (goalError) {
          console.error('Failed to fetch goals:', goalError.message);
        } else if (goalData) {
          setGoals({
            calories: goalData.target_calories || 2000,
            protein: goalData.target_protein || 120,
            carbs: goalData.target_carbs || 200,
            fats: goalData.target_fats || 60,
          });
        }

        // Fetch today's logged data from 'nutrition_logs'
        const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

        const { data: logData, error: logError } = await supabase
          .from('nutrition_logs')
          .select('meal_type, calories, protein, carbs, fats')
          .eq('user_id', session.user.id)
          .eq('log_date', today);

        if (logError) {
          console.error('Error fetching logs:', logError.message);
        } else if (logData && logData.length > 0) {
          const totalCalories = logData.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
          const totalProtein = logData.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
          const totalCarbs = logData.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
          const totalFats = logData.reduce((sum, item) => sum + (Number(item.fats) || 0), 0);

          setTotals({
            calories: Math.round(totalCalories),
            protein: Math.round(totalProtein),
            carbs: Math.round(totalCarbs),
            fats: Math.round(totalFats),
          });
        }

        setLoadingGoals(false);
        setLoadingData(false);
      };

      fetchGoalsAndData();
    }, [])
  );

  // Fetch featured recipe
  const fetchFeaturedRecipe = async () => {
    try {
      const storedData = await AsyncStorage.getItem('recipesData');
      if (storedData) {
        const { storedRecipes } = JSON.parse(storedData);
        if (storedRecipes && storedRecipes.length > 0) {
          setFeaturedRecipe(storedRecipes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch featured recipe:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFeaturedRecipe();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>


        {/* HEADER AND PROFILE ICON */}
        <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Home</Text>
        
        <TouchableOpacity
        style={styles.ProfileButton}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.4}>
       <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>

  </TouchableOpacity>
</View>
        



                {/* METRIC RINGS */}
        <TouchableOpacity 
          style={styles.metricsContainer} 
          onPress={() => navigation.navigate('Logger')}
          activeOpacity={0.9}
        >
          <View style={styles.macrosContainer}>
            <Text style={styles.macrosText}>Your macros today:</Text>
          </View>
          <View style={styles.metricsRow}>
            <MetricRingCard
              label="Calories"
              value={totals.calories}
              goal={goals.calories}
              unit="kcal"
              size="small"
              onPress={() => navigation.navigate('Logger')} 
            />
            <MetricRingCard
              label="Protein"
              value={totals.protein}
              goal={goals.protein}
              unit="g"
              size="small"
              onPress={() => navigation.navigate('Logger')}
            />
            <MetricRingCard
              label="Carbs"
              value={totals.carbs}
              goal={goals.carbs}
              unit="g"
              size="small"
              onPress={() => navigation.navigate('Logger')}
            />
            <MetricRingCard
              label="Fats"
              value={totals.fats}
              goal={goals.fats}
              unit="g"
              size="small"
              onPress={() => navigation.navigate('Logger')}
            />
          </View>
          <View style={styles.loggerPrompt}>
            <Text style={styles.loggerText}>Track Your Progress!</Text>
          </View>
        </TouchableOpacity>



              {/* SUGGESTED RECIPES */}
        <TouchableOpacity 
          style={styles.recipePreviewContainer}
          onPress={() => navigation.navigate('Recipes')}
          activeOpacity={0.4}
        >
          <View style={styles.recipeCard}>
            {featuredRecipe ? (
              <ImageBackground
                source={{ uri: featuredRecipe.image }}
                style={styles.recipeImage}
                imageStyle={{ borderRadius: 10 }}
              >
                <View style={styles.titleOverlay}>
                  <Text style={styles.previewTitle}>Your Recipes Today</Text>
                </View>
              </ImageBackground>
            ) : (
              <View style={styles.fallbackContainer}>
                <Text style={styles.previewTitle}>Your Recipes Today</Text>
                <Text style={styles.recipeCardText}>Recipe 1</Text>
              </View>
            )}
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
  headerRow: {
    height: 45,
    marginTop: 24,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    position: 'absolute',
    alignSelf: 'center',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  
  ProfileButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    padding: 6,
    backgroundColor: '#1E1E1E',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  

  metricsContainer: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 5,
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
  },
  macrosContainer: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  macrosText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  recipePreviewContainer: {
    marginHorizontal: 5,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  recipeCard: {
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start', 
  },
  titleOverlay: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)', 
    paddingVertical: 12,
    width: '100%',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fallbackContainer: {
    backgroundColor: '#1E1E1E',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeCardText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 6,
  },
});

export default HomeScreen;