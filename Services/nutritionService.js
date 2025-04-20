import { NUTRITION_API_KEY } from '@env';


export const fetchFoods = async (query) => {
  try {
    // request URL consturction
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=50&dataType=Foundation,SR%20Legacy&api_key=${NUTRITION_API_KEY}`;
    console.log("Request URL:", url.replace(NUTRITION_API_KEY, "API_KEY_HIDDEN"));
    

    // Make the API request
    const res = await fetch(url);
    console.log("Response status:", res.status);

    const data = await res.json();
    console.log("Data received:", !!data);
    console.log("Foods count:", data.foods?.length || 0);

    if (!data.foods || data.foods.length === 0) {
      return [];
    }

    // Sort results by whether description contains query
    const sortedResults = data.foods.sort((a, b) => {
      const aContains = a.description.toLowerCase().includes(query.toLowerCase());
      const bContains = b.description.toLowerCase().includes(query.toLowerCase());
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      return 0;
    });

    // Map and simplify the data
    const cleanResults = sortedResults
      .slice(0, 10)
      .map((item) => {
        const nutrients = item.foodNutrients || [];

        const getNutrient = (keyword) => {
          const match = nutrients.find((n) =>
            n.nutrientName && n.nutrientName.toLowerCase().includes(keyword)
          );
          return match?.value || 0;
        };

        return {
          name: item.description,
          fdcId: item.fdcId,
          calories: getNutrient("energy"),
          protein: getNutrient("protein"),
          fat: getNutrient("total lipid"),
          carbs: getNutrient("carbohydrate"),
          image: null,
          servingSize: "100g",
        };
      });

    console.log("Clean results count:", cleanResults.length);
    return cleanResults;

  } catch (err) {
    console.error("Error fetching food data:", err);
    console.error("Error details:", err.message);
    return [];
  }
};
