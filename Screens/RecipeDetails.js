import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { RECIPE_API_KEY } from '@env';

function RecipeDetails({ route }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await fetch(
          `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${RECIPE_API_KEY}&includeNutrition=true`
        );
        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        console.error('Failed to fetch recipe details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [recipeId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />;
  }

  if (!recipe) {
    return <Text style={styles.errorText}>Error loading recipe.</Text>;
  }

  // Macro + Micro Nutrients
  const macros = recipe.nutrition?.nutrients?.filter(n => 
    ['Calories', 'Protein', 'Fat', 'Carbohydrates', 'Fiber'].includes(n.name)
  );

  const micronutrients = recipe.nutrition?.nutrients?.filter(n => 
    n.name.includes('Vitamin') || n.name.includes('Mineral')
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title */}
      <Text style={styles.title}>{recipe.title}</Text>

      {/* Ingredients */}
      <View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>
      🧂 Ingredients • Serves {recipe.servings || '-'}
    </Text>
  </View>
  <View style={styles.ingredientGrid}>
    {recipe.extendedIngredients?.map((ing, index) => (
      <View key={index} style={styles.ingredientChip}>
        <Text style={styles.ingredientText}>{ing.original}</Text>
      </View>
    ))}
  </View>
</View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
        <View style={styles.instructionList}>
          {recipe.analyzedInstructions?.length > 0 ? (
            recipe.analyzedInstructions[0].steps.map((step, index) => (
              <View key={index} style={styles.step}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step.step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.text}>No instructions available.</Text>
          )}
        </View>
      </View>

      {/* Nutrition (Macros) */}
      {macros?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Nutrition (per serving)</Text>
          <View style={styles.nutritionGrid}>
            {macros.map((nutrient, index) => (
              <View key={index} style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(nutrient.amount)}{nutrient.unit}
                </Text>
                <Text style={styles.nutritionLabel}>{nutrient.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Micronutrients */}
      {micronutrients?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌿 Micronutrients</Text>
          <View style={styles.microGrid}>
            {micronutrients.slice(0, 6).map((nutrient, index) => (
              <Text key={index} style={styles.microText}>
                ✓ {nutrient.name}: {Math.round(nutrient.amount)}{nutrient.unit}
              </Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    backgroundColor: '#1E1E1E',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  ingredientText: {
    color: '#e0e0e0',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  ingredientChip: {
    backgroundColor: '#1E1E1E',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientText: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 18, 
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  nutritionItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    minWidth: '48%',
  },
  nutritionValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  nutritionLabel: {
    color: '#9E9E9E',
    fontSize: 13,
  },
  microGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  microText: {
    color: '#e0e0e0',
    fontSize: 13,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  instructionList: {
    paddingLeft: 8,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    color: '#FFA726',
    fontWeight: '600',
    marginRight: 8,
  },
  stepText: {
    color: '#e0e0e0',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default RecipeDetails;