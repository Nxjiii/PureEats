import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

const LoggedFoods = () => {
  const route = useRoute();
  const { mealType } = route.params;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated', userError);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('meal_type', mealType)
        .eq('log_date', today);

      if (error) {
        console.error('Error fetching logs:', error.message);
      } else {
        setLogs(data);
      }

      setLoading(false);
    };

    fetchLogs();
  }, [mealType]);

  const renderItem = ({ item }) => (
    <View style={styles.logCard}>
      <Text style={styles.foodName}>{item.food_name || 'Unnamed food'}</Text>
      <Text style={styles.macros}>
        {item.calories} kcal • {item.carbs}g C • {item.fats}g F • {item.protein}g P
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{mealType} Log</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : logs.length === 0 ? (
        <Text style={styles.emptyText}>No logs for today.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 80,  
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  logCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  macros: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  loadingText: {
    textAlign: 'center',
    color: '#BBBBBB',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#BBBBBB',
    marginTop: 50,
  },
});

export default LoggedFoods;
