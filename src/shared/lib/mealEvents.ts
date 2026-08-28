// Native EventTarget for meal events - no custom emitter needed
export const mealEvents = new EventTarget();

export type MealEventType = 'meal:added' | 'meal:removed' | 'meal:updated';

export interface MealEventDetail {
  mealId?: string;
  item?: any;
  itemId?: string;
}

// Helper to emit typed events
export function emitMealEvent(type: MealEventType, detail: MealEventDetail = {}) {
  mealEvents.dispatchEvent(new CustomEvent(type, { detail }));
}