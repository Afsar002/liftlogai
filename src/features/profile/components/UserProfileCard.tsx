import { useState } from "react";
import { FiSave, FiCamera, FiChevronRight } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import SelectDialog from "../../../shared/components/ui/SelectDialog";
import { useSettings } from "../../settings/hooks/SettingsProvider";
import type { Gender, ActivityLevel, FitnessGoal } from "../../settings/types";
import { cn } from "../../../shared/lib/cn";

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const ACTIVITY_OPTIONS: { label: string; value: ActivityLevel }[] = [
  { label: "Sedentary (little/no exercise)", value: "sedentary" },
  { label: "Light (1-3 days/week)", value: "light" },
  { label: "Moderate (3-5 days/week)", value: "moderate" },
  { label: "Active (6-7 days/week)", value: "active" },
  { label: "Very Active (physical job)", value: "very_active" },
];

const GOAL_OPTIONS: { label: string; value: FitnessGoal }[] = [
  { label: "Maintain Weight", value: "maintain" },
  { label: "Lose Weight", value: "lose" },
  { label: "Gain Weight", value: "gain" },
];

const inputClass =
  "w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:bg-white/5 dark:text-white dark:ring-white/10";

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between px-1">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
        {title}
      </h3>
      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
        {subtitle}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

interface UserProfileCardProps {
  /** Called when Save or Cancel is pressed so the parent can collapse the editor. */
  onClose?: () => void;
}

export default function UserProfileCard({ onClose }: UserProfileCardProps) {
  const {
    settings,
    updateProfile,
    updateGender,
    updateActivityLevel,
    updateFitnessGoal,
    updateHeightUnit,
    updateProfilePicture,
  } = useSettings();

  const [ageInput, setAgeInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [targetWeightInput, setTargetWeightInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
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
    if (settings.heightUnit === "ft" && (heightFeet || heightInches)) {
      const feet = heightFeet ? parseFloat(heightFeet) : heightFeetValue;
      const inches = heightInches ? parseFloat(heightInches) : heightInchesValue;
      const totalInches = feet * 12 + inches;
      updates.height = Math.round(totalInches * 2.54); // inches to cm
    } else if (heightInput) {
      updates.height = parseFloat(heightInput);
    }
    if (weightInput) updates.weight = parseFloat(weightInput);
    if (targetWeightInput) updates.targetWeight = parseFloat(targetWeightInput);
    const trimmedUsername = usernameInput.trim();
    if (trimmedUsername) updates.username = trimmedUsername;
    try {
      await updateProfile(updates);
    } catch (error) {
      console.error("Failed to save profile", error);
      return;
    }
    onClose?.();
    setAgeInput("");
    setHeightInput("");
    setHeightFeet("");
    setHeightInches("");
    setWeightInput("");
    setTargetWeightInput("");
    setUsernameInput("");
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await updateProfilePicture(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    onClose?.();
    setAgeInput("");
    setHeightInput("");
    setHeightFeet("");
    setHeightInches("");
  };

  // Display values for select fields
  const genderLabel =
    GENDER_OPTIONS.find((o) => o.value === settings.gender)?.label ??
    settings.gender;
  const activityLabel = settings.activityLevel
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const goalLabel =
    GOAL_OPTIONS.find((o) => o.value === settings.goal)?.label ?? settings.goal;

  // Height display values for ft mode placeholders
  const totalHeightInches = Math.round(settings.height / 2.54);
  const heightFeetValue = Math.floor(totalHeightInches / 12);
  const heightInchesValue = totalHeightInches % 12;

  return (
    <div className="space-y-6">
      {/* ── Personal ─────────────────────────────────── */}
      <div>
        <SectionHeader title="Personal" subtitle="your identity" />
        <Card padding="none">
          <div className="space-y-4 p-4">
            {/* Change Photo — subtle upload trigger, no duplicate avatar */}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-3 text-sm font-semibold text-zinc-500 transition hover:border-emerald-400 hover:text-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/40 dark:border-white/10 dark:text-zinc-400 dark:hover:border-emerald-400 dark:hover:text-emerald-400">
              <FiCamera size={16} aria-hidden="true" />
              Change Photo
              <input
                type="file"
                accept="image/*"
                aria-label="Change photo"
                onChange={handleProfilePictureChange}
                className="sr-only"
              />
            </label>
            {/* Name */}
            <Field label="Name">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={settings.username}
                className={inputClass}
              />
            </Field>

            {/* Age */}
            <Field label="Age">
              <div className="relative">
                <input
                  type="number"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  placeholder={settings.age.toString()}
                  className={inputClass}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  yrs
                </span>
              </div>
            </Field>

            {/* Gender */}
            <Field label="Gender">
              <button
                type="button"
                onClick={() => setGenderDialogOpen(true)}
                className={cn(
                  inputClass,
                  "flex items-center justify-between text-left"
                )}
              >
                <span>{genderLabel}</span>
                <FiChevronRight
                  size={16}
                  className="text-zinc-400 dark:text-zinc-500"
                  aria-hidden="true"
                />
              </button>
            </Field>
          </div>
        </Card>
      </div>

      {/* ── Body Metrics ──────────────────────────────── */}
      <div>
        <SectionHeader
          title="Body Metrics"
          subtitle="used for calorie targets"
        />
        <Card padding="none">
          <div className="space-y-4 p-4">
            {/* Height — redesigned ft + in layout */}
            <Field label="Height">
              <div className="space-y-2">
                {settings.heightUnit === "cm" ? (
                  <div className="relative">
                    <input
                      type="number"
                      value={heightInput}
                      onChange={(e) => setHeightInput(e.target.value)}
                      placeholder={settings.height.toString()}
                      className={inputClass}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                      cm
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                        placeholder={heightFeetValue.toString()}
                        className={inputClass}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                        ft
                      </span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        placeholder={heightInchesValue.toString()}
                        className={inputClass}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                        in
                      </span>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    updateHeightUnit(
                      settings.heightUnit === "cm" ? "ft" : "cm"
                    );
                    setHeightInput("");
                    setHeightFeet("");
                    setHeightInches("");
                  }}
                  className="text-[11px] font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
                >
                  Switch to {settings.heightUnit === "cm" ? "ft" : "cm"}
                </button>
              </div>
            </Field>

            {/* Weight */}
            <Field label="Weight">
              <div className="relative">
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder={settings.weight.toString()}
                  className={inputClass}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  kg
                </span>
              </div>
            </Field>

            {/* Target Weight */}
            <Field label="Target Weight">
              <div className="relative">
                <input
                  type="number"
                  value={targetWeightInput}
                  onChange={(e) => setTargetWeightInput(e.target.value)}
                  placeholder={settings.targetWeight.toString()}
                  className={inputClass}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  kg
                </span>
              </div>
            </Field>
          </div>
        </Card>
      </div>

      {/* ── Fitness Goals ─────────────────────────────── */}
      <div>
        <SectionHeader title="Fitness Goals" subtitle="your targets" />
        <Card padding="none">
          <div className="space-y-4 p-4">
            {/* Activity Level */}
            <Field label="Activity Level">
              <button
                type="button"
                onClick={() => setActivityDialogOpen(true)}
                className={cn(
                  inputClass,
                  "flex items-center justify-between text-left"
                )}
              >
                <span>{activityLabel}</span>
                <FiChevronRight
                  size={16}
                  className="text-zinc-400 dark:text-zinc-500"
                  aria-hidden="true"
                />
              </button>
            </Field>

            {/* Fitness Goal */}
            <Field label="Goal">
              <button
                type="button"
                onClick={() => setGoalDialogOpen(true)}
                className={cn(
                  inputClass,
                  "flex items-center justify-between text-left"
                )}
              >
                <span>{goalLabel}</span>
                <FiChevronRight
                  size={16}
                  className="text-zinc-400 dark:text-zinc-500"
                  aria-hidden="true"
                />
              </button>
            </Field>
          </div>
        </Card>
      </div>

      {/* ── Save / Cancel ─────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-3 text-sm font-bold text-emerald-950 shadow-md shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-400 hover:to-lime-300 active:scale-[0.98]"
        >
          <FiSave size={16} aria-hidden="true" />
          Save Changes
        </button>
        <button
          onClick={handleCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
        >
          Cancel
        </button>
      </div>

      {/* ── Select Dialogs ────────────────────────────── */}
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
    </div>
  );
}