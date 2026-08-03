export interface ExerciseDefinition {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
}

export const exerciseLibrary: ExerciseDefinition[] = [
  { id: "bench_press", name: "Bench Press", muscle: "Chest", equipment: "Barbell" },
  { id: "incline_db_press", name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Dumbbell" },
  { id: "decline_bench", name: "Decline Bench Press", muscle: "Chest", equipment: "Barbell" },
  { id: "dumbbell_fly", name: "Dumbbell Fly", muscle: "Chest", equipment: "Dumbbell" },
  { id: "chest_dip", name: "Chest Dip", muscle: "Chest", equipment: "Bodyweight" },

  { id: "barbell_row", name: "Barbell Row", muscle: "Back", equipment: "Barbell" },
  { id: "dumbbell_row", name: "One-Arm Dumbbell Row", muscle: "Back", equipment: "Dumbbell" },
  { id: "lat_pulldown", name: "Lat Pulldown", muscle: "Back", equipment: "Cable" },
  { id: "pull_up", name: "Pull Up", muscle: "Back", equipment: "Bodyweight" },
  { id: "chin_up", name: "Chin Up", muscle: "Back", equipment: "Bodyweight" },
  { id: "seated_cable_row", name: "Seated Cable Row", muscle: "Back", equipment: "Cable" },

  { id: "squat", name: "Back Squat", muscle: "Legs", equipment: "Barbell" },
  { id: "front_squat", name: "Front Squat", muscle: "Legs", equipment: "Barbell" },
  { id: "goblet_squat", name: "Goblet Squat", muscle: "Legs", equipment: "Dumbbell" },
  { id: "leg_press", name: "Leg Press", muscle: "Legs", equipment: "Machine" },
  { id: "romanian_deadlift", name: "Romanian Deadlift", muscle: "Hamstrings", equipment: "Barbell" },
  { id: "deadlift", name: "Deadlift", muscle: "Back", equipment: "Barbell" },
  { id: "lunges", name: "Walking Lunges", muscle: "Legs", equipment: "Bodyweight" },
  { id: "step_up", name: "Step Up", muscle: "Legs", equipment: "Bodyweight" },
  { id: "calf_raise", name: "Standing Calf Raise", muscle: "Calves", equipment: "Bodyweight" },

  { id: "shoulder_press", name: "Overhead Press", muscle: "Shoulders", equipment: "Barbell" },
  { id: "dumbbell_shoulder_press", name: "Dumbbell Shoulder Press", muscle: "Shoulders", equipment: "Dumbbell" },
  { id: "lateral_raise", name: "Lateral Raise", muscle: "Shoulders", equipment: "Dumbbell" },
  { id: "rear_delt_fly", name: "Rear Delt Fly", muscle: "Shoulders", equipment: "Dumbbell" },
  { id: "arnold_press", name: "Arnold Press", muscle: "Shoulders", equipment: "Dumbbell" },

  { id: "barbell_curl", name: "Barbell Curl", muscle: "Biceps", equipment: "Barbell" },
  { id: "dumbbell_curl", name: "Dumbbell Curl", muscle: "Biceps", equipment: "Dumbbell" },
  { id: "hammer_curl", name: "Hammer Curl", muscle: "Biceps", equipment: "Dumbbell" },
  { id: "preacher_curl", name: "Preacher Curl", muscle: "Biceps", equipment: "Machine" },

  { id: "tricep_pushdown", name: "Triceps Pushdown", muscle: "Triceps", equipment: "Cable" },
  { id: "skull_crusher", name: "Skull Crusher", muscle: "Triceps", equipment: "Barbell" },
  { id: "dips", name: "Triceps Dip", muscle: "Triceps", equipment: "Bodyweight" },

  { id: "plank", name: "Plank", muscle: "Core", equipment: "Bodyweight" },
  { id: "side_plank", name: "Side Plank", muscle: "Core", equipment: "Bodyweight" },
  { id: "hanging_leg_raise", name: "Hanging Leg Raise", muscle: "Core", equipment: "Bodyweight" },
  { id: "crunch", name: "Crunch", muscle: "Core", equipment: "Bodyweight" },
  { id: "russian_twist", name: "Russian Twist", muscle: "Core", equipment: "Bodyweight" },

  { id: "push_up", name: "Push Up", muscle: "Chest", equipment: "Bodyweight" },
  { id: "incline_push_up", name: "Incline Push Up", muscle: "Chest", equipment: "Bodyweight" },
  { id: "decline_push_up", name: "Decline Push Up", muscle: "Chest", equipment: "Bodyweight" },

  { id: "leg_extension", name: "Leg Extension", muscle: "Quads", equipment: "Machine" },
  { id: "leg_curl", name: "Leg Curl", muscle: "Hamstrings", equipment: "Machine" },

  { id: "glute_bridge", name: "Glute Bridge", muscle: "Glutes", equipment: "Bodyweight" },
  { id: "hip_thrust", name: "Barbell Hip Thrust", muscle: "Glutes", equipment: "Barbell" },

  { id: "kettlebell_swing", name: "Kettlebell Swing", muscle: "Full Body", equipment: "Kettlebell" },
  { id: "burpee", name: "Burpee", muscle: "Full Body", equipment: "Bodyweight" },
  { id: "mountain_climber", name: "Mountain Climber", muscle: "Core", equipment: "Bodyweight" },

  { id: "seated_calf_raise", name: "Seated Calf Raise", muscle: "Calves", equipment: "Machine" },

  { id: "face_pull", name: "Face Pull", muscle: "Rear Delts", equipment: "Cable" },
  { id: "good_morning", name: "Good Morning", muscle: "Hamstrings", equipment: "Barbell" },

  { id: "farmer_carry", name: "Farmer Carry", muscle: "Full Body", equipment: "Dumbbell" },
  { id: "sled_push", name: "Sled Push", muscle: "Legs", equipment: "Sled" },

  { id: "incline_db_row", name: "Incline Dumbbell Row", muscle: "Back", equipment: "Dumbbell" },
  { id: "t_bar_row", name: "T-Bar Row", muscle: "Back", equipment: "Barbell" },

  { id: "cable_fly", name: "Cable Fly", muscle: "Chest", equipment: "Cable" },

  { id: "single_leg_deadlift", name: "Single-Leg Romanian Deadlift", muscle: "Hamstrings", equipment: "Dumbbell" },

  { id: "box_jump", name: "Box Jump", muscle: "Legs", equipment: "Plyo Box" },

  { id: "prowler_push", name: "Prowler Push", muscle: "Full Body", equipment: "Sled" },

  { id: "battle_rope", name: "Battle Rope", muscle: "Full Body", equipment: "Battle Rope" },

  { id: "dip_machine", name: "Assisted Dip", muscle: "Chest/Triceps", equipment: "Machine" },

  { id: "incline_cable_row", name: "Incline Cable Row", muscle: "Back", equipment: "Cable" },

  { id: "reverse_lunge", name: "Reverse Lunge", muscle: "Legs", equipment: "Bodyweight" },

  { id: "box_squat", name: "Box Squat", muscle: "Legs", equipment: "Barbell" },

  { id: "yclimb", name: "Hill Sprints", muscle: "Cardio", equipment: "Bodyweight" },

  { id: "sprint_intervals", name: "Sprint Intervals", muscle: "Cardio", equipment: "Bodyweight" },

  { id: "elliptical", name: "Elliptical", muscle: "Cardio", equipment: "Machine" },

  { id: "rowing_machine", name: "Rowing Machine", muscle: "Cardio", equipment: "Machine" },

  { id: "battle_rope_slams", name: "Battle Rope Slams", muscle: "Full Body", equipment: "Battle Rope" },

  { id: "seated_shoulder_press", name: "Seated Shoulder Press", muscle: "Shoulders", equipment: "Machine" },

  { id: "neck_flexion", name: "Neck Flexion", muscle: "Neck", equipment: "Bodyweight" },

  { id: "shrug", name: "Barbell Shrug", muscle: "Traps", equipment: "Barbell" },

  { id: "scap_pull", name: "Scapular Pull-Up", muscle: "Back", equipment: "Bodyweight" }
];