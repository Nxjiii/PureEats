import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator} from 'react-native';
import { fetchFoods } from '../Services/nutritionService';
import FoodResultCard from '../components/FoodResultCard';
import { useNavigation } from '@react-navigation/native';

const Search = ({ route }) => {

  // State for search query input
  const [query, setQuery] = useState('');

  // hold results returned from API
  const [results, setResults] = useState([]);

  // loading indicator while fetching
  const [loading, setLoading] = useState(false);

  // State to track whether a search has been made yet
  const [searched, setSearched] = useState(false);

  // Navigation hook
  const navigation = useNavigation();

  // Called when user submits a search
  const handleSearch = async () => {
    if (!query.trim()) return; 
    console.log("Searching for:", query);
    setLoading(true);     
    setSearched(true);     
    const data = await fetchFoods(query); 
    setResults(data);     
    setLoading(false);    
  };

  return (
    <View style={styles.container}>
      {/* Text input for food query */}
      <TextInput
        style={styles.input}
        placeholder="Search food..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />

      {/* Show loading spinner/ list of results/ fallback message */}
      {loading ? (
        <ActivityIndicator size="large" color="#00ff99" style={{ marginTop: 20 }} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => ( 
          <FoodResultCard
         food={item}
          onLog={() => navigation.navigate('FoodDetails', { 
          food: item,
          mealType: route.params?.mealType // Forward the mealType from route.params
       })}
        />
          
      )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : searched ? (
        <Text style={styles.noResults}>No results found.</Text>
      ) : null}
    </View>
  );
};

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
  noResults: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default Search;
