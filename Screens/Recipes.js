import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, FlatList, Dimensions, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RECIPE_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_MARGIN = 10;
const ROW_SPACING = 60;

function Recipes({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchRecipes = async () => {
    try {
      // Check if already fetched today
      const storedData = await AsyncStorage.getItem('recipesData');
      if (storedData) {
        const { fetchDate, storedRecipes } = JSON.parse(storedData);
        const lastFetchDate = new Date(fetchDate);
        const currentDate = new Date();
        
        // If the stored date is from today, use stored recipes
        if (lastFetchDate.toDateString() === currentDate.toDateString() && storedRecipes.length > 0) {
          console.log(' cached recipes from today');
          setRecipes(storedRecipes);
          setLoading(false);
          return;
        }
      }
      
      // Otherwise fetch new recipes
      console.log('Fetching new recipes');
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?number=6&apiKey=${RECIPE_API_KEY}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }      
      
      if (data.recipes && Array.isArray(data.recipes)) {
        // Save the new data with current timestamp
        const recipesData = {
          fetchDate: new Date().toISOString(),
          storedRecipes: data.recipes
        };
        await AsyncStorage.setItem('recipesData', JSON.stringify(recipesData));
        
        setRecipes(data.recipes);
      } else {
        console.error('Unexpected API response format:', data);
        setRecipes([]);
      }
    } catch (err) {
      console.error('Failed to fetch or retrieve recipes:', err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRecipes();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}
      onPress={() => navigation.navigate('RecipeDetails', { recipeId: item.id })}
>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.cardImage}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.cardText}>{item.title || 'No Title Available'}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
    
  const renderRow = (rowData) => (
    <FlatList
      horizontal
      data={rowData}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
      decelerationRate="fast"
      contentContainerStyle={{ paddingLeft: CARD_MARGIN / 2, paddingRight: CARD_MARGIN * 1.5 }}
    />
  );

  const rows = [
    recipes.slice(0, 2),
    recipes.slice(2, 4),
    recipes.slice(4, 6),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.RecipesContainer}>
          {loading ? (
            <View style={{ marginTop: 40 }}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            rows.map((row, index) => (
              <View key={index} style={{ marginBottom: ROW_SPACING }}>
                {renderRow(row)}
              </View>
            ))
          )}
        </View>
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
    paddingBottom: height * 0.2,
  },
  RecipesContainer: {
    padding: 20,
  },
card: {
  width: CARD_WIDTH,
  height: 180,
  marginTop: 20,
  backgroundColor: '#1E1E1E',
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: CARD_MARGIN,
  borderWidth: 1, // Adds a thin border
  borderColor: '#333', // Color of the border
  shadowColor: '#000', // Shadow color
  shadowOffset: { width: 0, height: 2 }, // Shadow offset (horizontal, vertical)
  shadowOpacity: 0.8, // Shadow opacity
  shadowRadius: 4, // Shadow blur radius
  elevation: 5, // For Android shadow
},

  cardText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: 180,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default Recipes;