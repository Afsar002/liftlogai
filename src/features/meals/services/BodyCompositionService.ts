export interface BodyCompositionEntry {
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi?: number;
}

export class BodyCompositionService {
  /**
   * Calculate BMI from weight and height
   */
  static calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }

  /**
   * Calculate body fat percentage using BMI method (rough estimate)
   */
  static calculateBodyFatFromBMI(bmi: number, age: number, gender: 'male' | 'female'): number {
    // Deurenberg formula
    const base = (1.20 * bmi) + (0.23 * age) - 10.8;
    const adjustment = gender === 'male' ? 0 : 5.4;
    return Math.round((base - adjustment) * 10) / 10;
  }

  /**
   * Calculate lean body mass
   */
  static calculateLeanBodyMass(weightKg: number, bodyFatPercent: number): number {
    return Math.round((weightKg * (1 - bodyFatPercent / 100)) * 10) / 10;
  }

  /**
   * Calculate muscle mass (roughly 75% of lean mass is muscle)
   */
  static calculateMuscleMass(leanBodyMass: number): number {
    return Math.round(leanBodyMass * 0.75 * 10) / 10;
  }

  /**
   * Get body composition category
   */
  static getBodyFatCategory(bodyFatPercent: number, gender: 'male' | 'female'): string {
    if (gender === 'male') {
      if (bodyFatPercent < 10) return 'Essential Fat';
      if (bodyFatPercent < 14) return 'Athletic';
      if (bodyFatPercent < 18) return 'Fitness';
      if (bodyFatPercent < 25) return 'Average';
      return 'Obese';
    } else {
      if (bodyFatPercent < 14) return 'Essential Fat';
      if (bodyFatPercent < 21) return 'Athletic';
      if (bodyFatPercent < 25) return 'Fitness';
      if (bodyFatPercent < 32) return 'Average';
      return 'Obese';
    }
  }

  /**
   * Calculate weight change over time
   */
  static calculateWeightChange(history: BodyCompositionEntry[]): { change: number; days: number } {
    if (history.length < 2) {
      return { change: 0, days: 0 };
    }

    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const change = last.weight - first.weight;
    const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);

    return {
      change: Math.round(change * 100) / 100,
      days: Math.round(days),
    };
  }

  /**
   * Get progress summary
   */
  static getProgressSummary(history: BodyCompositionEntry[]): {
    totalChange: number;
    weeklyRate: number;
    currentBMI: number;
    bmiCategory: string;
  } {
    const { change, days } = this.calculateWeightChange(history);
    const weeklyRate = days > 0 ? Math.round((change / days) * 7 * 100) / 100 : 0;
    const latest = history[history.length - 1];
    const currentBMI = latest.bmi || this.calculateBMI(latest.weight, 170); // Default height if not provided
    const bmiCategory = this.getBMICategory(currentBMI);

    return {
      totalChange: change,
      weeklyRate,
      currentBMI,
      bmiCategory,
    };
  }

  /**
   * Get BMI category
   */
  static getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }
}