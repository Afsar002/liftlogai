import { useState } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Badge from '../../../../shared/components/ui/Badge';
import Select from '../../../../shared/components/ui/Select';
import type { CompetitionPrepInputs, CompetitionPrepResults } from '../../types/expert';

interface Props {
  onCalculate: (inputs: CompetitionPrepInputs) => CompetitionPrepResults;
}

export default function CompetitionPrepCalculator({ onCalculate }: Props) {
  const [inputs, setInputs] = useState<CompetitionPrepInputs>({
    currentWeight: 80,
    targetWeight: 75,
    bodyFatPercentage: 15,
    weeksUntilShow: 12,
    targetWeeklyLoss: 0.5,
    dailyActivity: 'moderate',
    trainingDays: 5,
    cardioSessions: 3,
  });
  const [results, setResults] = useState<CompetitionPrepResults | null>(null);

  const handleCalculate = () => {
    const r = onCalculate(inputs);
    setResults(r);
  };

  const updateInput = (key: keyof CompetitionPrepInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Competition Prep Calculator</h2>
        <Badge variant="info" size="sm">Advanced</Badge>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Current Weight (kg)</label>
              <input type="number" value={inputs.currentWeight} onChange={(e) => updateInput('currentWeight', parseFloat(e.target.value) || 0)}
                className="w-full mt-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Target Weight (kg)</label>
              <input type="number" value={inputs.targetWeight} onChange={(e) => updateInput('targetWeight', parseFloat(e.target.value) || 0)}
                className="w-full mt-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Body Fat (%)</label>
              <input type="number" value={inputs.bodyFatPercentage} onChange={(e) => updateInput('bodyFatPercentage', parseFloat(e.target.value) || 0)}
                className="w-full mt-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Weeks Until Show</label>
              <input type="number" value={inputs.weeksUntilShow} onChange={(e) => updateInput('weeksUntilShow', parseFloat(e.target.value) || 0)}
                className="w-full mt-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Target Weekly Loss (kg)</label>
              <input type="number" step="0.1" value={inputs.targetWeeklyLoss} onChange={(e) => updateInput('targetWeeklyLoss', parseFloat(e.target.value) || 0)}
                className="w-full mt-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Daily Activity</label>
              <Select
                value={inputs.dailyActivity}
                onChange={(value) => updateInput('dailyActivity', value)}
                options={[
                  { label: 'Sedentary', value: 'sedentary' },
                  { label: 'Light', value: 'light' },
                  { label: 'Moderate', value: 'moderate' },
                  { label: 'Active', value: 'active' },
                  { label: 'Very Active', value: 'very_active' },
                ]}
                className="mt-1"
                ariaLabel="Daily Activity"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Training Days/Week</label>
              <input type="number" value={inputs.trainingDays} onChange={(e) => updateInput('trainingDays', parseFloat(e.target.value) || 0)}
                className="w-full mt-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Cardio Sessions/Week</label>
              <input type="number" value={inputs.cardioSessions} onChange={(e) => updateInput('cardioSessions', parseFloat(e.target.value) || 0)}
                className="w-full mt-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>

          <Button className="w-full" onClick={handleCalculate}>
            Calculate Contest Prep
          </Button>
        </div>
      </Card>

      {results && (
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Results</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl">
                <span className="text-xs text-zinc-500">Maintenance Calories</span>
                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{results.maintenanceCalories}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-xs text-zinc-500">Contest Calories</span>
                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{results.contestCalories}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-xs text-zinc-500">Daily Deficit</span>
                <p className="font-bold text-lg text-red-600 dark:text-red-400">{results.dailyDeficit}</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-xs text-zinc-500">Expected Weekly Loss</span>
                <p className="font-bold text-lg text-yellow-600 dark:text-yellow-400">{results.expectedWeeklyFatLoss} kg</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-xs text-zinc-500">Projected Stage Weight</span>
                <p className="font-bold text-lg text-purple-600 dark:text-purple-400">{results.projectedStageWeight} kg</p>
              </div>
            </div>
            <div className="border-t border-zinc-200/80 dark:border-white/10 pt-3">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Recommended Daily Intake</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div><span className="text-xs text-zinc-500">Protein</span><p className="font-bold text-zinc-900 dark:text-white">{results.proteinRecommendation}g</p></div>
                <div><span className="text-xs text-zinc-500">Carbs</span><p className="font-bold text-zinc-900 dark:text-white">{results.carbRecommendation}g</p></div>
                <div><span className="text-xs text-zinc-500">Fat</span><p className="font-bold text-zinc-900 dark:text-white">{results.fatRecommendation}g</p></div>
                <div><span className="text-xs text-zinc-500">Water</span><p className="font-bold text-zinc-900 dark:text-white">{results.waterRecommendation}ml</p></div>
                <div><span className="text-xs text-zinc-500">Sodium</span><p className="font-bold text-zinc-900 dark:text-white">{results.sodiumRecommendation}mg</p></div>
                <div><span className="text-xs text-zinc-500">Fiber</span><p className="font-bold text-zinc-900 dark:text-white">{results.fiberRecommendation}g</p></div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}