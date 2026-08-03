import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FiX } from 'react-icons/fi';
import { AnimatedOverlay, AnimatedPanel } from '../../../shared/components/motion/AnimatedDialog';
import type { UserSettings } from '../../settings/types';
import type { CalorieCalculation } from '../../../shared/lib/calorieCalculator';
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS } from '../../../shared/lib/calorieCalculator';

interface Props {
  open: boolean;
  onClose: () => void;
  calculation: CalorieCalculation | null;
  settings: UserSettings | null;
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary (little/no exercise)',
  light: 'Light (1-3 days/week)',
  moderate: 'Moderate (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  very_active: 'Very Active (physical job)',
};

const GOAL_LABELS: Record<string, string> = {
  maintain: 'Maintain Weight',
  lose: 'Lose Weight',
  gain: 'Gain Weight',
};

export default function CalorieBreakdownDialog({ open, onClose, calculation, settings }: Props) {
  if (!calculation || !settings) return null;

  const deficitLabel =
    calculation.deficitOrSurplus > 0
      ? `+${calculation.deficitOrSurplus} kcal surplus`
      : calculation.deficitOrSurplus < 0
        ? `${calculation.deficitOrSurplus} kcal deficit`
        : 'No adjustment';

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <AnimatedOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <AnimatedPanel className="w-full max-w-md">
        <DialogPanel className="w-full max-w-md rounded-2xl border bg-white p-6 dark:border-white/6 dark:bg-[#141417]">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
              Calorie Calculation
            </DialogTitle>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/8 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* User Profile */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Your Profile
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Age:</span>
                  <span className="ml-1 text-zinc-900 dark:text-white">{settings.age} years</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Gender:</span>
                  <span className="ml-1 text-zinc-900 dark:text-white capitalize">{settings.gender}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Height:</span>
                  <span className="ml-1 text-zinc-900 dark:text-white">{settings.height} cm</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Weight:</span>
                  <span className="ml-1 text-zinc-900 dark:text-white">{settings.weight} kg</span>
                </div>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Calculation Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">BMR (Mifflin-St Jeor):</span>
                  <span className="text-zinc-900 dark:text-white font-medium">{calculation.bmr} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Activity ({ACTIVITY_LABELS[settings.activityLevel]}):
                  </span>
                  <span className="text-zinc-900 dark:text-white font-medium">
                    × {ACTIVITY_MULTIPLIERS[settings.activityLevel]}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-200/80 dark:border-white/6 pt-2">
                  <span className="text-zinc-500 dark:text-zinc-400">TDEE:</span>
                  <span className="text-zinc-900 dark:text-white font-medium">{calculation.tdee} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Goal ({GOAL_LABELS[settings.goal]}):
                  </span>
                  <span className="text-zinc-900 dark:text-white font-medium">
                    × {GOAL_ADJUSTMENTS[settings.goal]}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-200/80 dark:border-white/6 pt-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Adjustment:</span>
                  <span className={`font-medium ${
                    calculation.deficitOrSurplus > 0
                      ? 'text-orange-500'
                      : calculation.deficitOrSurplus < 0
                        ? 'text-blue-500'
                        : 'text-zinc-900 dark:text-white'
                  }`}>
                    {deficitLabel}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-zinc-200/80 dark:border-white/6 pt-2">
                  <span className="text-zinc-900 dark:text-white">Required Calories:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{calculation.requiredCalories} kcal</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Update your profile in Settings to recalculate. You can also set a custom goal manually.
            </p>
          </div>
        </DialogPanel>
        </AnimatedPanel>
      </div>
    </Dialog>
  );
}
