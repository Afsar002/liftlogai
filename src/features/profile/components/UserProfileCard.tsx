import { useState } from 'react';
import { FiSave, FiUser, FiCamera } from 'react-icons/fi';
import Card from '../../../shared/components/ui/Card';
import ListRow from '../../../shared/components/ui/ListRow';
import SectionTitle from '../../../shared/components/ui/SectionTitle';
import SelectDialog from '../../../shared/components/ui/SelectDialog';
import { useSettings } from '../../settings/hooks/SettingsProvider';
import type { Gender, ActivityLevel, FitnessGoal } from '../../settings/types';

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const ACTIVITY_OPTIONS: { label: string; value: ActivityLevel }[] = [
  { label: 'Sedentary (little/no exercise)', value: 'sedentary' },
  { label: 'Light (1-3 days/week)', value: 'light' },
  { label: 'Moderate (3-5 days/week)', value: 'moderate' },
  { label: 'Active (6-7 days/week)', value: 'active' },
  { label: 'Very Active (physical job)', value: 'very_active' },
];

const GOAL_OPTIONS: { label: string; value: FitnessGoal }[] = [
  { label: 'Maintain Weight', value: 'maintain' },
  { label: 'Lose Weight', value: 'lose' },
  { label: 'Gain Weight', value: 'gain' },
];

interface UserProfileCardProps {
  /** Called when Save or Cancel is pressed so the parent can collapse the editor. */
  onClose?: () => void;
}

export default function UserProfileCard({ onClose }: UserProfileCardProps) {
  const { settings, updateProfile, updateGender, updateActivityLevel, updateFitnessGoal, updateHeightUnit, updateUsername, updateProfilePicture } = useSettings();

  const [ageInput, setAgeInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [targetWeightInput, setTargetWeightInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [genderDialogOpen, setGenderDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  if (!settings) {
    return null;
  }

  const handleSave = async () => {
    const updates: Record<string, unknown> = {};
    if (ageInput) updates.age = parseInt(ageInput, 10);
    
    // Handle height conversion
    if (settings.heightUnit === 'ft' && (heightFeet || heightInches)) {
      const feet = parseFloat(heightFeet) || 0;
      const inches = parseFloat(heightInches) || 0;
      const totalInches = (feet * 12) + inches;
      updates.height = Math.round(totalInches * 2.54); // inches to cm
    } else if (heightInput) {
      updates.height = parseFloat(heightInput);
    }
    
    if (weightInput) updates.weight = parseFloat(weightInput);
    if (targetWeightInput) updates.targetWeight = parseFloat(targetWeightInput);
    if (usernameInput) updates.username = usernameInput;
    await updateProfile(updates);
    onClose?.();
    setAgeInput('');
    setHeightInput('');
    setHeightFeet('');
    setHeightInches('');
    setWeightInput('');
    setTargetWeightInput('');
    setUsernameInput('');
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await updateProfilePicture(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    onClose?.();
    setAgeInput('');
    setHeightInput('');
    setWeightInput('');
    setTargetWeightInput('');
  };

  return (
    <Card>
      <SectionTitle
        title={`${settings.username}'s Profile`}
        subtitle="Your body metrics are used to calculate daily calorie needs"
        action={<FiUser size={20} />}
      />

      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          {settings?.profilePicture ? (
            <img
              src={settings.profilePicture}
              alt="Profile"
              className="h-24 w-24 rounded-full border-2 border-zinc-100 object-cover dark:border-white/6"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/8">
              <FiUser size={40} className="text-zinc-400" />
            </div>
          )}
          <label
            aria-label="Change profile picture"
            className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 p-2 text-emerald-950 shadow-md shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-lime-300">
            <FiCamera size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        {/* Username */}
        <ListRow
          title="Name"
          value={settings.username}
          trailing={
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder={settings.username}
              className="w-32 px-1 py-0.5 text-sm text-right rounded-lg bg-zinc-100 text-right text-zinc-900 ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:bg-white/8 dark:text-white dark:ring-white/10"
            />
          }
        />

        {/* Age */}
        <ListRow
          title="Age"
          value={settings.age}
          trailing={
            <input
              type="number"
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              placeholder={settings.age.toString()}
              className="w-16 px-1 py-0.5 text-xs text-right rounded-lg bg-zinc-100 text-right text-zinc-900 ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:bg-white/8 dark:text-white dark:ring-white/10"
            />
          }
        />

        {/* Gender */}
        <ListRow
          title="Gender"
          value={<span className="capitalize">{settings.gender}</span>}
          trailing={
            <SelectDialog
              open={genderDialogOpen}
              title="Select Gender"
              selected={settings.gender}
              onClose={() => setGenderDialogOpen(false)}
              onSelect={(value) => {
                updateGender(value as Gender);
                setGenderDialogOpen(false);
              }}
              options={GENDER_OPTIONS}
            />
          }
          onClick={() => setGenderDialogOpen(true)}
          clickable
        />

        {/* Height */}
        <ListRow
          title="Height"
          value={settings.heightUnit === 'cm' ? `${settings.height} cm` : `${Math.floor(settings.height / 2.54 / 12)}'${Math.round((settings.height / 2.54) % 12)}"`}
          trailing={
            <div className="flex flex-wrap items-center justify-end gap-1">
              {settings.heightUnit === 'cm' ? (
                <input
                  type="number"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  placeholder={settings.height.toString()}
                  className="w-16 px-1 py-0.5 text-xs text-right rounded-lg bg-zinc-100 text-right text-zinc-900 ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:bg-white/8 dark:text-white dark:ring-white/10"
                />
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    placeholder={Math.floor(settings.height / 2.54 / 12).toString()}
                    className="w-12 px-1 py-0.5 text-xs text-right rounded-lg bg-zinc-100 text-right text-zinc-900 ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:bg-white/8 dark:text-white dark:ring-white/10"
                  />
                  <span className="text-xs text-zinc-500">'</span>
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    placeholder={Math.round((settings.height / 2.54) % 12).toString()}
                    className="w-12 px-1 py-0.5 text-xs text-right rounded-lg bg-zinc-100 text-right text-zinc-900 ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:bg-white/8 dark:text-white dark:ring-white/10"
                  />
                  <span className="text-xs text-zinc-500">"</span>
                </div>
              )}
              <button
                onClick={() => {
                  updateHeightUnit(settings.heightUnit === 'cm' ? 'ft' : 'cm');
                  setHeightInput('');
                  setHeightFeet('');
                  setHeightInches('');
                }}
                className="rounded-lg bg-zinc-100 px-1.5 py-0.5 text-xs font-semibold transition hover:bg-zinc-200 dark:bg-white/8 dark:hover:bg-white/12"
              >
                {settings.heightUnit === 'cm' ? 'cm' : 'ft'}
              </button>
            </div>
          }
        />

        {/* Weight */}
        <ListRow
          title="Weight"
          value={`${settings.weight} kg`}
          trailing={
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder={settings.weight.toString()}
              className="w-20 px-1 py-0.5 text-sm text-right rounded-lg bg-zinc-100 text-right text-zinc-900 ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:bg-white/8 dark:text-white dark:ring-white/10"
            />
          }
        />

        {/* Activity Level */}
        <ListRow
          title="Activity Level"
          value={<span className="capitalize">{settings.activityLevel.replace('_', ' ')}</span>}
          trailing={
            <SelectDialog
              open={activityDialogOpen}
              title="Select Activity Level"
              selected={settings.activityLevel}
              onClose={() => setActivityDialogOpen(false)}
              onSelect={(value) => {
                updateActivityLevel(value as ActivityLevel);
                setActivityDialogOpen(false);
              }}
              options={ACTIVITY_OPTIONS}
            />
          }
          onClick={() => setActivityDialogOpen(true)}
          clickable
        />

        {/* Goal */}
        <ListRow
          title="Fitness Goal"
          value={<span className="capitalize">{settings.goal.replace('_', ' ')}</span>}
          trailing={
            <SelectDialog
              open={goalDialogOpen}
              title="Select Goal"
              selected={settings.goal}
              onClose={() => setGoalDialogOpen(false)}
              onSelect={(value) => {
                updateFitnessGoal(value as FitnessGoal);
                setGoalDialogOpen(false);
              }}
              options={GOAL_OPTIONS}
            />
          }
          onClick={() => setGoalDialogOpen(true)}
          clickable
        />

        {/* Target Weight */}
        <ListRow
          title="Target Weight"
          value={`${settings.targetWeight} kg`}
          trailing={
            <input
              type="number"
              value={targetWeightInput}
              onChange={(e) => setTargetWeightInput(e.target.value)}
              placeholder={settings.targetWeight.toString()}
              className="w-20 px-1 py-0.5 text-sm text-right rounded-lg bg-zinc-100 text-right text-zinc-900 ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:bg-white/8 dark:text-white dark:ring-white/10"
            />
          }
        />
      </div>

      {/* Save / Cancel buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-md shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-400 hover:to-lime-300 active:scale-[0.98]"
        >
          <FiSave size={16} />
          Save Changes
        </button>
        <button
          onClick={handleCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
        >
          Cancel
        </button>
      </div>
    </Card>
  );
}
