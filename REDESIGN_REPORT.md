# LiftLogAI — Phase 2 Visual Redesign Report

Scope: Dribbble-quality visual redesign of the entire app (11 phases). **Zero functionality changed** — no business logic, routes, or data touched. Visual-only + shared-primitive consolidation.

Animation engine: **Motion (Framer Motion)** — the only animation engine, honored via `MotionConfig reducedMotion="user"` and the shared motion primitives.

Build status: `tsc -b` clean ✓ · `NODE_ENV=development npm run build` ✓ (4.9s) · PWA `generateSW` ✓ · Code-splitting + vendor chunks preserved.

---

## Design language — "OBSIDIAN"

| Token | Light | Dark |
|---|---|---|
| Base | `#fafafa` | `#0B0B0D` |
| Card surface | `#ffffff` + `shadow-card` | `#141417` + `white/6` hairline |
| Accent | `emerald-500 → lime-400` gradient | same |
| On-accent | `text-emerald-950` (dark text on lime) | same |
| Shape | `rounded-2xl` cards · `rounded-full` pills · `rounded-xl` inputs | same |
| Gutters | 24px (`px-6`), `space-y-8` page rhythm | same |
| Icon chips | `h-11 w-11 rounded-2xl bg-zinc-100` (neutral) | `dark:bg-white/8` |
| Focus ring | `focus:ring-2 focus:ring-emerald-500/30` | same |

**Accent discipline (per direction):** emerald→lime is reserved for primary CTAs, the Workout CTA in bottom nav, active tabs, streaks, personal records, completed states, progress, and on-track metrics. Secondary actions stay neutral zinc. The app is never overwhelmed by green.

---

## What changed per screen

### P1–P3 · Shared primitives + navigation
- Built `PageHeader`, `BackButton`, `SectionTitle`, `MetricCard`, `AnimatedCard`, `AnimatedDialog`, `AnimatedTabs`, `AnimatedSearch`, motion variants (fade/rise/spring).
- Every root screen now carries a `PageHeader` (`size="page"` + subtitle). Detail screens use `size="detail"` + Back.
- All screens normalized to `space-y-8` with consistent 24px gutters.

### P4 · Bottom navigation
- Floating pill nav, raised center **Workout CTA** with emerald→lime gradient + `text-emerald-950`.
- Gradient tab indicator via `AnimatedTabIndicator` (shared `layoutId`).
- Inactive icons neutral zinc; active tab + Workout CTA are the only accent surfaces.
- Haptic-style press animations (`whileTap scale:0.96`); nav hides on scroll down, reveals on scroll up (Spring).

### P5 · Dashboard
- Hero gradient card, greeting + date, quick CTA.
- Shared `MetricCard` grid with emerald accents on streak / progress-only metrics.
- Cards → `AnimatedCard` + `Card` surfaces with soft shadows (light) / hairlines (dark).

### P6 · Workout logger + summary
- Exercise cards `rounded-2xl`, labeled Sets/Reps/Rest inputs, `focus:ring-emerald-500/30`.
- Completed-set rows / summary use emerald accents; neutral surfaces elsewhere.
- `ExerciseCard` (active-session summary) → OBSIDIAN tokens, muted "Previous" reference.

### P7 · Exercise Library + details
- Library cards redesigned with icon alignment, tabs, `AnimatedSearch`.
- Details page: hero media, back-aware headers (Continue Workout from active session).
- Skeleton/placeholder tokens normalized to `dark:bg-white/8`.

### P8 · History + workout details
- `HistoryCard`: neutral record card, `Stat` tiles (`text-2xl font-bold tabular-nums`), emerald only on delete-hover + completed state.
- `HistoryGroup`: neutral date pill + hairline.
- `WeeklySummary` + `WorkoutDetailPage`: emerald icon chip + "Completed" pill, 4 shared MetricCards.
- Empty state → `FiActivity`.

### P9 · Analytics
- Replaced feature-local `MetricCard` (emoji) with the **shared** `MetricCard` + Fi icons — removed a duplicate.
- Accent reserved: Current Streak (`FiZap`), Personal Records (`FiAward`).
- All 5 recharts components standardized: gradient `#10b981 → #a3e635`, grid `rgba(113,113,122,0.2)`, dark tooltip, neutral chart headers.
- Donut palette: emerald/lime/teal family.

### P10 · Meals
- PageHeader + expert-mode toggle, segmented tabs with `AnimatedTabIndicator`, macro/micronutrient tiles, water bar kept blue (semantic).
- `MealCard` header/body split, `MealItemRow` hover rows, `FoodSearchItem` chevron rows.
- Expert subcomponents (`RawFoodMode`, `CompetitionPrepCalculator`, `ExpertNutritionDashboard`) re-tokenized to emerald/zinc.

### P11 · Templates + editor + profile
- `TemplateCard`: gradient accent bar, exercise-count badge, gradient "Start Workout" CTA.
- `TemplateEditor`: `text-2xl font-extrabold` name input, labeled Sets/Reps/Rest inputs, dashed Add Exercise, gradient Save.
- Profile: added `PageHeader`, `space-y-8`; `UserProfileCard` inputs/buttons → rounded + emerald focus, gradient Save, neutral Edit; `AboutCard` hairline tokens.
- Shared `SelectDialog` panel → `dark:bg-[#141417] dark:border-white/6`.

---

## Verdicts

- `tsc -b`: **clean** (0 errors) — fixed 3 invalid Feather icons (`FiFlame`/`FiTimer`/`FiTrophy` → `FiZap`/`FiTarget`/`FiAward`).
- Production build: **success**, 4.9s, PWA precache 11 entries, code-split chunks preserved.
- Routes: all 17 `/app/App.tsx` routes intact (verified).
- Functionality: no component duplication introduced (shared primitives reused everywhere); no service/hook/business logic modified.
- Dead code (never imported) left in place per "no implementation cleanup": `analytics/MetricCard.tsx`, `profile/ui/Card.tsx`, `ProfileHeader.tsx`, `ProgressHistoryCard.tsx`, `records/PRCard.tsx`, `EmptyHistory.tsx`, `exercises/ExercisePicker.tsx`, `templates/ExerciseRow.tsx`/`ExercisePicker.tsx`.

## Remaining notes
- Pre-existing bundler warning: `exercises` chunk ~1.3 MB (exercise data/media for offline PWA) — unchanged by this phase.
