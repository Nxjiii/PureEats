/**
 * CalorieCalculator.js
 * calculating calorie and macro targets based on user metrics.
 * Mifflin-St Jeor equation for BMR calculation, applies activity multipliers
 * calculates appropriate macros based on selected goal.
 */

const CalorieCalculator = {
    /**
     * Calculate calorie targets and appropriate macros based on user metrics
     * @param {Object} userData - User metrics for calculation
     * @param {string} userData.gender - 'male' or 'female'
     * @param {number} userData.age - Age in years
     * @param {number} userData.height - Height in cm
     * @param {number} userData.weight - Weight in kg
     * @param {string} userData.activityLevel - Activity level (sedentary, light, moderate, active, veryActive)
     * @returns {Object} Calculated calorie and macro targets
     */
    calculate(userData) {
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      
      if (userData.gender === 'male') {
        bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
      } else {
        bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161;
      }
      
      // Apply activity multiplier
      const activityMultipliers = {
        sedentary: 1.2,      // Little or no exercise
        light: 1.375,        // Light exercise 1-3 days/week
        moderate: 1.55,      // Moderate exercise 3-5 days/week
        active: 1.725,       // Hard exercise 6-7 days/week
        veryActive: 1.9      // Very hard exercise, physical job or training twice a day
      };
      
      const tdee = Math.round(bmr * activityMultipliers[userData.activityLevel]);
      
      // Determine recommended goal based on BMI
      const heightInM = userData.height / 100;
      const bmi = userData.weight / (heightInM * heightInM);
      
      let recommendedGoal;
      if (bmi < 18.5) {
        recommendedGoal = 'Bulk'; // Underweight
      } else if (bmi >= 25) {
        recommendedGoal = 'Weight Loss'; // Overweight
      } else {
        recommendedGoal = 'Maintain'; // Normal weight
      }
      
      // Calculate macros for maintenance by default
      const calories = tdee;
      
      // Calculate macros based on maintenance calories
      // For maintenance: 30% protein, 40% carbs, 30% fat
      const protein = Math.round((calories * 0.3) / 4); // 4 calories per gram of protein
      const carbs = Math.round((calories * 0.4) / 4);   // 4 calories per gram of carbs
      const fats = Math.round((calories * 0.3) / 9);    // 9 calories per gram of fat
      
      return {
        recommendedGoal,
        calories,
        protein,
        carbs,
        fats
      };
    },
    
    /**
     * Adjust calorie and macro targets based on selected goal and intensity
     * @param {string} goal - Selected goal (Weight Loss, Maintain, Bulk)
     * @param {string} intensity - Selected intensity (Moderate, Intense)
     * @param {number} maintenanceCalories - Calculated maintenance calories
     * @param {number} weight - User's weight in kg
     * @returns {Object} Adjusted calorie and macro targets
     */
    adjustForIntensity(goal, intensity, maintenanceCalories, weight) {
      let calories = maintenanceCalories;
      let proteinRatio, carbsRatio, fatsRatio;
      
      // Apply calorie adjustments based on goal and intensity
      if (goal === 'Weight Loss') {
        if (intensity === 'Moderate') {
          calories = Math.round(maintenanceCalories - 500); // 500 calorie deficit
          proteinRatio = 0.35;  // Higher protein for satiety and muscle preservation
          carbsRatio = 0.35;    // Moderate carbs
          fatsRatio = 0.3;      // Moderate fats
        } else if (intensity === 'Intense') {
          calories = Math.round(maintenanceCalories - 750); // 750 calorie deficit
          proteinRatio = 0.4;   // Even higher protein to preserve muscle
          carbsRatio = 0.3;     // Lower carbs
          fatsRatio = 0.3;      // Moderate fats
        }
      } else if (goal === 'Bulk') {
        if (intensity === 'Moderate') {
          calories = Math.round(maintenanceCalories + 300); // 300 calorie surplus
          proteinRatio = 0.3;   // Higher protein for muscle growth
          carbsRatio = 0.45;    // Higher carbs for energy
          fatsRatio = 0.25;     // Moderate fats
        } else if (intensity === 'Intense') {
          calories = Math.round(maintenanceCalories + 500); // 500 calorie surplus
          proteinRatio = 0.3;   // Higher protein for muscle growth
          carbsRatio = 0.5;     // Even higher carbs for energy
          fatsRatio = 0.2;      // Lower fats
        }
      } else {
        // Maintenance - use default ratios
        proteinRatio = 0.3;     // Balanced protein
        carbsRatio = 0.4;       // Balanced carbs
        fatsRatio = 0.3;        // Balanced fats
      }
      
      // Calculate protein based on bodyweight (minimum value)
      // For weight loss: 1.8-2.2g per kg of bodyweight
      // For maintenance: 1.6-1.8g per kg of bodyweight
      // For bulking: 1.8-2.2g per kg of bodyweight
      let minProteinByWeight;
      
      if (goal === 'Weight Loss') {
        minProteinByWeight = Math.round(weight * 2.0); // Higher end for weight loss
      } else if (goal === 'Bulk') {
        minProteinByWeight = Math.round(weight * 2.0); // Higher end for bulking
      } else {
        minProteinByWeight = Math.round(weight * 1.6); // Lower end for maintenance
      }
      
      // Calculate macros based on ratios
      let protein = Math.round((calories * proteinRatio) / 4);
      
      // Ensure protein meets minimum requirements based on bodyweight
      protein = Math.max(protein, minProteinByWeight);
      
      // Recalculate remaining calories after protein allocation
      const remainingCalories = calories - (protein * 4);
      
      // Adjust carbs and fats based on remaining calories
      const adjustedRatio = carbsRatio / (carbsRatio + fatsRatio);
      const carbs = Math.round((remainingCalories * adjustedRatio) / 4);
      const fats = Math.round((remainingCalories * (1 - adjustedRatio)) / 9);
      
      return {
        calories,
        protein,
        carbs,
        fats
      };
    }
  };
  
  export default CalorieCalculator;