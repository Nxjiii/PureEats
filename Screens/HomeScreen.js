import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, FlatList, Dimensions, TouchableOpacity,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MetricRingCard from '../components/MetricRingCard'; 

const { width } = Dimensions.get('window');

function HomeScreen() {
  const navigation = useNavigation();


  // Metric ring card 

  // Placeholder total nutrients (normally fetched from API)
  const totals = {
    calories: 1200,
    protein: 90,
    carbs: 160,
    fat: 50,
  };


  // Placeholder daily goals (normally from user profile or settings)
  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* METRIC RINGS */}
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.metricsRow}>
          <MetricRingCard label="Calories" value={totals.calories} goal={goals.calories} unit="kcal"  onPress={() => navigation.navigate('Logger')} />
          <MetricRingCard label="Protein" value={totals.protein} goal={goals.protein} unit="g" onPress={() => navigation.navigate('Logger')}/>
          <MetricRingCard label="Carbs" value={totals.carbs} goal={goals.carbs} unit="g" onPress={() => navigation.navigate('Logger')}/>
          <MetricRingCard label="Fat" value={totals.fat} goal={goals.fat} unit="g" onPress={() => navigation.navigate('Logger')}/>
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
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
    marginBottom: 20,
  
  },
  
    
});

export default HomeScreen;
