export function estimate1RM(weight: number, reps: number) {
  return Math.round(weight * (1 + reps / 30));
}