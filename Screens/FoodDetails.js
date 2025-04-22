import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient'; 

const FoodDetails = ({ route }) => {
  const { food } = route.params;
  const navigation = useNavigation();
  
  const [quantity, setQuantity] = useState(food.servingSize || 100);
  const [unit, setUnit] = useState(food.servingSizeUnit || 'g');
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState({
    calories: food.calories,
    protein: food.protein,
    fat: food.fat,
    carbs: food.carbs
  });
  
  // Prepare unit options
  const unitOptions = [
    { label: 'g', value: 'g' },
    ...(food.portions?.filter(p => p.modifier).map(portion => ({
      label: portion.modifier,
      value: portion.modifier,
      portionData: portion
    })) || [])
  ];
  
  // Calculate nutrition based on quantity and unit
  const calculateNutrition = (qty, selectedUnit) => {
    let multiplier = 1;
    
    if (selectedUnit !== 'g') {
      const portion = unitOptions.find(u => u.value === selectedUnit)?.portionData;
      if (portion) {
        multiplier = portion.gramWeight / portion.amount;
      }
    }
    
    const ratio = (qty * multiplier) / 100;
    
    setCalculatedNutrition({
      calories: (food.calories * ratio).toFixed(2),
      protein: (food.protein * ratio).toFixed(2),
      fat: (food.fat * ratio).toFixed(2),
      carbs: (food.carbs * ratio).toFixed(2)
    });
  };
  
  useEffect(() => {
    calculateNutrition(quantity, unit);
  }, [quantity, unit]);
  
  const handleUnitSelect = (selectedUnit) => {
    setShowUnitModal(false);
    setUnit(selectedUnit);
    const selectedPortion = unitOptions.find(u => u.value === selectedUnit)?.portionData;
    if (selectedPortion) {
      setQuantity(selectedPortion.amount);
    }
  };
  
  const handleLogFood = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated', userError);
      return;
    }
  
    const today = new Date().toISOString().split('T')[0];
    const { mealType } = route.params;
  
    const logData = {
      user_id: user.id,
      meal_type: mealType,
      food_name: food.name,
      log_date: today,
      calories: calculatedNutrition.calories,
      carbs: calculatedNutrition.carbs,
      fats: calculatedNutrition.fat,
      protein: calculatedNutrition.protein,
      created_at: new Date().toISOString(),
      quantity: parseFloat(quantity),
      unit,
    };
  
    // Insert new log entry for each food item
    const { error } = await supabase
      .from('nutrition_logs')
      .insert([logData]);
  
    if (error) {
      console.error('Error logging food:', error.message);
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{food.name}</Text>
  
      {/* Displaying Macros */}
      <View style={styles.macroContainer}>
        <Text style={styles.macroText}>Calories: {calculatedNutrition.calories} {food.energyUnit || 'kcal'}</Text>
        <Text style={styles.macroText}>Protein: {calculatedNutrition.protein}g</Text>
        <Text style={styles.macroText}>Fat: {calculatedNutrition.fat}g</Text>
        <Text style={styles.macroText}>Carbs: {calculatedNutrition.carbs}g</Text>
      </View>
  
      {/* Serving Size Selection */}
      <View style={styles.servingContainer}>
        <Text style={styles.servingText}>Quantity:</Text>
        <TextInput
          style={styles.quantityInput}
          keyboardType="numeric"
          value={String(quantity)}
          onChangeText={(text) => setQuantity(text)}
          onBlur={() => calculateNutrition(quantity, unit)}
        />
        
        <TouchableOpacity 
          style={styles.unitButton}
          onPress={() => setShowUnitModal(true)}
        >
          <Text style={styles.unitButtonText}>{unit}</Text>
        </TouchableOpacity>
      </View>
  
      {/* Unit Selection Modal */}
      <Modal
        visible={showUnitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Unit</Text>
            <FlatList
              data={unitOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.unitOption}
                  onPress={() => handleUnitSelect(item.value)}
                >
                  <Text style={styles.unitOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowUnitModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      {/* Log Button */}
      <TouchableOpacity style={styles.logButton} onPress={handleLogFood}>
        <Text style={styles.logButtonText}>Log Food</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  macroContainer: {
    marginBottom: 30,
  },
  macroText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8,
  },
  servingContainer: {
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginRight: 10,
  },
  quantityInput: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    width: 80,
    textAlign: 'center',
  },
  unitButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  unitButtonText: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  unitOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  unitOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#BB86FC',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: '#BB86FC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FoodDetails;
