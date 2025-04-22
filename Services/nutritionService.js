import { NUTRITION_API_KEY } from '@env';

export const fetchFoods = async (query) => {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=50&dataType=Foundation,SR%20Legacy&api_key=${NUTRITION_API_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (!data.foods || data.foods.length === 0) {
      return [];
    }

    // Sort results by relevance
    const sortedResults = data.foods.sort((a, b) => {
      const aContains = a.description.toLowerCase().includes(query.toLowerCase());
      const bContains = b.description.toLowerCase().includes(query.toLowerCase());
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      return 0;
    });

    // Map and simplify the data
    const cleanResults = sortedResults.slice(0, 10).map((item) => {
      const nutrients = item.foodNutrients || [];
      
      const getNutrient = (keyword) => {
        const match = nutrients.find((n) =>
          n.nutrientName && n.nutrientName.toLowerCase().includes(keyword)
        );
        return match?.value || 0;
      };

      // Get the most common portion (prioritize household units)
      const householdPortion = item.foodPortions?.find(p => p.measureUnit && !p.measureUnit.includes('g')) || 
                              item.foodPortions?.[0] || 
                              { amount: 100, modifier: 'g', gramWeight: 100 };

      return {
        name: item.description,
        fdcId: item.fdcId,
        calories: getNutrient("energy"),
        protein: getNutrient("protein"),
        fat: getNutrient("total lipid"),
        carbs: getNutrient("carbohydrate"),
        image: null,
        servingSize: householdPortion.amount,
        servingSizeUnit: householdPortion.modifier || 'g',
        gramWeight: householdPortion.gramWeight || householdPortion.amount, // For conversion
        portions: item.foodPortions || []
      };
    });

    return cleanResults;

  } catch (err) {
    console.error("Error fetching food data:", err);
    return [];
  }
};