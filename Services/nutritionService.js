// Fetch foods from Open Food Facts API based on user query
export const fetchFoods = async (query) => {
    try {
      // Call the Open Food Facts search endpoint with the query
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`
      );
  
      const data = await res.json();
  
      // Filter for matches that include the query (case-insensitive)
      const matches = data.products.filter((p) =>
        p.product_name && p.product_name.toLowerCase().includes(query.toLowerCase())
      );
  
      // Sort results by relevance: prioritize products that start with the query or contain the query early in the name
      const sortedResults = matches.sort((a, b) => {
        const aMatchIndex = a.product_name.toLowerCase().indexOf(query.toLowerCase());
        const bMatchIndex = b.product_name.toLowerCase().indexOf(query.toLowerCase());
        return aMatchIndex - bMatchIndex; // Items with query at the beginning come first
      });
  
      // Clean and format the results
      const cleanResults = sortedResults
        .filter((p) =>
          p.product_name && // Ensure product has a name
          p.nutriments?.['energy-kcal_100g'] // Ensure product has calorie data
        )
        .slice(0, 10) // Limit to first 10 results
        .map((item) => ({
          name: item.product_name,
          calories: item.nutriments['energy-kcal_100g'],
          protein: item.nutriments['proteins_100g'] || 0,
          fat: item.nutriments['fat_100g'] || 0,
          carbs: item.nutriments['carbohydrates_100g'] || 0,
          image: item.image_url || null,
          servingSize: item.nutriments['serving_size'] || '100g',
        }));
  
      return cleanResults;
  
    } catch (err) {
      // Handle any errors during fetch
      console.error('Error fetching food data:', err);
      return [];
    }
  };
  