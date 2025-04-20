import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, FlatList, Dimensions, TouchableOpacity, ImageBackground} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MetricRingCard from '../components/MetricRingCard'; 
import AsyncStorage from '@react-native-async-storage/async-storage';


function HomeScreen() {
  const navigation = useNavigation();
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [featuredRecipe, setFeaturedRecipe] = useState(null);


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



  const fetchFeaturedRecipe = async () => {
    try {
      // Get recipes from AsyncStorage
      const storedData = await AsyncStorage.getItem('recipesData');
      if (storedData) {
        const { storedRecipes } = JSON.parse(storedData);
        if (storedRecipes && storedRecipes.length > 0) {
          // Get the first recipe
          setFeaturedRecipe(storedRecipes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch featured recipe:', err);
    }
  };

  fetchGoals();
  fetchFeaturedRecipe();
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
           <View style={styles.macros}>
            <Text style={styles.macros}>Your macros today:</Text>
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
    label="Fat"
    value={totals.fat}
    goal={goals.fat}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 20,
    textAlign: 'center',
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
  macros: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop : 10,
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