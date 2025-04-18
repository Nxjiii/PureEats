/**
 * CalorieCalculator.js
 * Calculates calorie and macro targets for all goal/intensity combinations.
 * Uses Mifflin-St Jeor equation for BMR and applies activity multipliers.
 */

const CalorieCalculator = {
  /**
   * Main function to compute maintenance and all goal/intensity options
   * @param {Object} userData - User metrics for calculation
   * @returns {Object} All calorie/macro targets and recommended goal
   */
  calculate(userData) {
    const { gender, age, height, weight, activityLevel } = userData;

    // --- Step 1: Calculating BMR using Mifflin-St Jeor Equation ---
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // --- Step 2: Apply Activity Multiplier ---
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

    // --- Step 3: BMI & Recommended Goal ---
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    let recommendedGoal;

    if (bmi < 18.5) {
      recommendedGoal = 'Bulk';
    } else if (bmi >= 25) {
      recommendedGoal = 'Weight Loss';
    } else {
      recommendedGoal = 'Maintain';
    }

    // --- Step 4: Maintenance Macros (default 30/40/30 split) ---
    const maintenance = this._calculateMacros(tdee, 0.3, 0.4, 0.3, weight);

    // --- Step 5: All Goal/Intensity Adjustments ---
    const weightLossModerate = this._adjustForGoal('Weight Loss', 'Moderate', tdee, weight);
    const weightLossIntense = this._adjustForGoal('Weight Loss', 'Intense', tdee, weight);
    const bulkModerate = this._adjustForGoal('Bulk', 'Moderate', tdee, weight);
    const bulkIntense = this._adjustForGoal('Bulk', 'Intense', tdee, weight);

    return {
      recommendedGoal,
      maintenance,
      weightLoss: {
        moderate: weightLossModerate,
        intense: weightLossIntense
      },
      bulk: {
        moderate: bulkModerate,
        intense: bulkIntense
      }
    };
  },

  /**
   * Private helper: Adjust macros for goal and intensity
   */
  _adjustForGoal(goal, intensity, maintenanceCalories, weight) {
    let calories = maintenanceCalories;
    let proteinRatio, carbsRatio, fatsRatio;

    if (goal === 'Weight Loss') {
      calories -= intensity === 'Intense' ? 750 : 500;
      proteinRatio = intensity === 'Intense' ? 0.4 : 0.35;
      carbsRatio = intensity === 'Intense' ? 0.3 : 0.35;
      fatsRatio = 0.3;
    } else if (goal === 'Bulk') {
      calories += intensity === 'Intense' ? 500 : 300;
      proteinRatio = 0.3;
      carbsRatio = intensity === 'Intense' ? 0.5 : 0.45;
      fatsRatio = intensity === 'Intense' ? 0.2 : 0.25;
    } else {
      calories = maintenanceCalories;
      proteinRatio = 0.3;
      carbsRatio = 0.4;
      fatsRatio = 0.3;
    }

    return this._calculateMacros(calories, proteinRatio, carbsRatio, fatsRatio, weight, goal);
  },

  /**
   * Private helper: Calculate macros from calorie and ratios, enforcing min protein
   */
  _calculateMacros(calories, proteinRatio, carbsRatio, fatsRatio, weight, goal = 'Maintain') {
    // Base protein grams from ratio
    let protein = Math.round((calories * proteinRatio) / 4);

    // Enforce minimum protein based on body weight
    let minProteinPerKg = 1.6;
    if (goal === 'Weight Loss' || goal === 'Bulk') minProteinPerKg = 2.0;

    const minProtein = Math.round(weight * minProteinPerKg);
    protein = Math.max(protein, minProtein);

    // Remaining calories after protein
    const remainingCalories = calories - (protein * 4);

    // Adjusted carbs/fats from remaining cals
    const adjustedCarbsRatio = carbsRatio / (carbsRatio + fatsRatio);
    const carbs = Math.round((remainingCalories * adjustedCarbsRatio) / 4);
    const fats = Math.round((remainingCalories * (1 - adjustedCarbsRatio)) / 9);

    return {
      calories,
      protein,
      carbs,
      fats
    };
  }
};

export default CalorieCalculator;