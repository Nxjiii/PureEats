import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchFoods } from '../Services/nutritionService';
import FoodResultCard from '../components/FoodResultCard'; 

const Search = () => {
    // Local state for search input, results, and loading status
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
  
    // Triggered when user searches — fetch foods from API
    const handleSearch = async () => {
      if (!query.trim()) return;
      setLoading(true);
      const data = await fetchFoods(query);
      setResults(data);
      setLoading(false);
    };
  
    // Placeholder for logging a food item to Supabase
    const handleLog = (item) => {
      console.log('Logging:', item); // ← will later send this to your DB
    };
  
    return (
      <View style={styles.container}>
        {/* Search input */}
        <TextInput
          style={styles.input}
          placeholder="Search food..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
  
        {/* Show loading indicator or results */}
        {loading ? (
          <ActivityIndicator size="large" color="#00ff99" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <FoodResultCard food={item} onLog={() => handleLog(item)} />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    );
  };
  
  // UI styles
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 16 },
    input: {
      backgroundColor: '#1e1e1e',
      color: 'white',
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
    },
  });
  
  export default Search