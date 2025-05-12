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

      // Find portion closest to 100g or use the default portion
      const closestPortion = item.foodPortions?.reduce((closest, current) => {
        const currentWeight = current.gramWeight || 100;
        if (Math.abs(currentWeight - 100) < Math.abs(closest.gramWeight - 100)) {
          return current;
        }
        return closest;
      }, { amount: 100, modifier: 'g', gramWeight: 100 }) || { amount: 100, modifier: 'g', gramWeight: 100 };

      // Get energy in the correct unit (kcal or kJ)
      const energyNutrient = nutrients.find((n) =>
        n.nutrientName && n.nutrientName.toLowerCase().includes('energy')
      );
      
      let energy = energyNutrient?.value || 0;
      let energyUnit = 'kcal';  // Default to kcal
      if (energyNutrient?.unitName.toLowerCase() === 'kj') {
        // Convert kJ to kcal (1 kcal = 4.184 kJ)
        energy = (energy / 4.184).toFixed(2);
        energyUnit = 'kcal';  // Set unit to kcal
      }

      return {
        name: item.description,
        fdcId: item.fdcId,
        calories: energy,
        energyUnit: energyUnit,  // Add the energy unit (kcal or kJ)
        protein: getNutrient("protein"),
        fat: getNutrient("total lipid"),
        carbs: getNutrient("carbohydrate"),
        image: null,
        servingSize: closestPortion.amount,
        servingSizeUnit: closestPortion.modifier || 'g',
        gramWeight: closestPortion.gramWeight || closestPortion.amount, // For conversion
        portions: item.foodPortions || []
      };
    });

    return cleanResults;

  } catch (err) {
    console.error("Error fetching food data:", err);
    return [];
  }
};
