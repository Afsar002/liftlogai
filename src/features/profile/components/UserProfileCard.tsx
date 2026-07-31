import { useState } from 'react';
import { FiEdit3, FiSave, FiUser, FiCamera, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import Card from '../../../shared/components/ui/Card';
import ListRow from '../../../shared/components/ui/ListRow';
import SectionTitle from '../../../shared/components/ui/SectionTitle';
import SelectDialog from '../../../shared/components/ui/SelectDialog';
import { useSettings } from '../../settings/hooks/SettingsProvider';
import type { Gender, ActivityLevel, FitnessGoal } from '../../settings/types';
import { calculateRequiredCalories } from '../../../shared/lib/calorieCalculator';
import { SettingsService } from '../../settings/services/SettingsService';

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

export default function UserProfileCard() {
  const { settings, updateProfile, updateGender, updateActivityLevel, updateFitnessGoal, updateHeightUnit, updateUsername, updateProfilePicture, updateExpertMode } = useSettings();

  const [editing, setEditing] = useState(false);
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

  const calculation = calculateRequiredCalories(settings);

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
    setEditing(false);
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
    setEditing(false);
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
              className="w-24 h-24 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <FiUser size={40} className="text-zinc-400" />
            </div>
          )}
          {editing && (
            <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
              <FiCamera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {/* Username */}
        <ListRow
          title="Name"
          value={settings.username}
          trailing={
            editing ? (
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={settings.username}
                className="w-32 px-1 py-0.5 text-sm text-right bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            ) : undefined
          }
        />

        {/* Age */}
        <ListRow
          title="Age"
          value={settings.age}
          trailing={
            editing ? (
              <input
                type="number"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                placeholder={settings.age.toString()}
                className="w-16 px-1 py-0.5 text-xs text-right bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            ) : undefined
          }
        />

        {/* Gender */}
        <ListRow
          title="Gender"
          value={<span className="capitalize">{settings.gender}</span>}
          trailing={
            editing ? (
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
            ) : undefined
          }
          onClick={editing ? () => setGenderDialogOpen(true) : undefined}
          clickable={editing}
        />

        {/* Height */}
        <ListRow
          title="Height"
          value={settings.heightUnit === 'cm' ? `${settings.height} cm` : `${Math.floor(settings.height / 2.54 / 12)}'${Math.round((settings.height / 2.54) % 12)}"`}
          trailing={
            editing ? (
              <div className="flex items-center gap-1">
                {settings.heightUnit === 'cm' ? (
                  <input
                    type="number"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    placeholder={settings.height.toString()}
                    className="w-16 px-1 py-0.5 text-xs text-right bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      placeholder={Math.floor(settings.height / 2.54 / 12).toString()}
                      className="w-12 px-1 py-0.5 text-xs text-right bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                    <span className="text-xs text-zinc-500">'</span>
                    <input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      placeholder={Math.round((settings.height / 2.54) % 12).toString()}
                      className="w-12 px-1 py-0.5 text-xs text-right bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
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
                  className="px-1.5 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
                >
                  {settings.heightUnit === 'cm' ? 'cm' : 'ft'}
                </button>
              </div>
            ) : undefined
          }
        />

        {/* Weight */}
        <ListRow
          title="Weight"
          value={`${settings.weight} kg`}
          trailing={
            editing ? (
              <input
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={settings.weight.toString()}
                className="w-20 px-1 py-0.5 text-sm text-right bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            ) : undefined
          }
        />

        {/* Activity Level */}
        <ListRow
          title="Activity Level"
          value={<span className="capitalize">{settings.activityLevel.replace('_', ' ')}</span>}
          trailing={
            editing ? (
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
            ) : undefined
          }
          onClick={editing ? () => setActivityDialogOpen(true) : undefined}
          clickable={editing}
        />

        {/* Goal */}
        <ListRow
          title="Fitness Goal"
          value={<span className="capitalize">{settings.goal.replace('_', ' ')}</span>}
          trailing={
            editing ? (
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
            ) : undefined
          }
          onClick={editing ? () => setGoalDialogOpen(true) : undefined}
          clickable={editing}
        />

        {/* Target Weight */}
        <ListRow
          title="Target Weight"
          value={`${settings.targetWeight} kg`}
          trailing={
            editing ? (
              <input
                type="number"
                value={targetWeightInput}
                onChange={(e) => setTargetWeightInput(e.target.value)}
                placeholder={settings.targetWeight.toString()}
                className="w-20 px-1 py-0.5 text-sm text-right bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            ) : undefined
          }
        />
      </div>

      {/* Edit / Save buttons */}
      <div className="mt-4 flex gap-2">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <FiSave size={16} />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <FiEdit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>
    </Card>
  );
}
