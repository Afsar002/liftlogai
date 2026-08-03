// Simple event emitter for meal-related updates
// Allows useExpertMode to notify useMeals when food is logged/removed

type MealEventType = 'meal:added' | 'meal:removed' | 'meal:updated';

type MealEventListener = (event: MealEventType, data?: any) => void;

class MealEventEmitter {
  private listeners: Set<MealEventListener> = new Set();

  subscribe(listener: MealEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: MealEventType, data?: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (err) {
        console.error('Meal event listener error:', err);
      }
    });
  }
}

export const mealEvents = new MealEventEmitter();