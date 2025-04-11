import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, FlatList, Dimensions, TouchableOpacity,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MetricRingCard from '../components/MetricRingCard'; 



function HomeScreen() {
  const navigation = useNavigation();

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
        <Text style={styles.sectionTitle}>Home</Text>
        
        <TouchableOpacity 
          style={styles.metricsContainer} 
          onPress={() => navigation.navigate('Logger')}
          activeOpacity={0.9}
        >
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
    marginBottom: 50,
    textAlign: 'center',
  },
  metricsContainer: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
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
    paddingVertical: 16,
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
  }
});

export default HomeScreen;