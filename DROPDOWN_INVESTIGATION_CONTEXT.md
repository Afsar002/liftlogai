# Dropdown/Select/Menu Investigation Context

## Current Work
The user previously had a duplicate Back button on every Exercise Detail page. That was fixed by removing a redundant top-level `{back && !isHero && ...}` block in `src/shared/components/ui/PageHeader.tsx` that duplicated the BackButton already rendered inside the non-hero branch. TypeScript compiles cleanly.

The user now says: "the back button are working now i need the drop down" — i.e., they want the dropdown/select/menu components fixed next.

## Requirements (from user feedback)
- Respect the current theme (light or dark).
- Match the styling of cards, dialogs and inputs in each theme.
- Use theme tokens or CSS variables instead of hardcoded colors.
- Text must always have sufficient contrast.
- Hover, focus and selected states should adapt automatically to the active theme.
- No white text on white backgrounds.
- No black text on dark backgrounds.
- No browser-default appearance that conflicts with the app design.
- Ensure every dropdown feels native to LiftLog AI in both light and dark mode.
- Use the existing design system and theme provider rather than creating separate styles for each component.

## Key Technical Concepts
- **Theme system**: `src/shared/providers/ThemeProvider.tsx` toggles a `dark` class on `html`/`body` and sets `data-theme`. Default theme is "dark".
- **Design tokens**: Defined in `src/index.css` via Tailwind v4 `@theme` block. Key tokens:
  - Surfaces: `--color-surface` (#ffffff), `--color-surface-elevated` (#ffffff), `--color-surface-dark` (#0e0e10), `--color-surface-dark-elevated` (#141417)
  - Borders: `--color-border-light`, `--color-border-dark`, `--color-border-hover-light`, `--color-border-hover-dark`
  - Text: `--color-text-primary-light` (#0a0a0c), `--color-text-secondary-light` (#3f3f46), `--color-text-tertiary-light` (#71717a), `--color-text-primary-dark` (#fafafa), `--color-text-secondary-dark` (#d4d4d8), `--color-text-tertiary-dark` (#a1a1aa)
  - Accents: `--color-accent-emerald` (#0ea875), `--color-accent-emerald-dark` (#059669), `--color-accent-lime` (#a3e635)
  - Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-full`
  - Shadows: `--shadow-card`, `--shadow-card-hover`, `--shadow-elevated`, `--shadow-glass`
- **Dark mode**: Tailwind v4 `@variant dark (&:where(.dark, .dark *))` — so `dark:` variants work.
- **cn utility**: `src/shared/lib/cn.ts` — classnames joiner.

## Relevant Files and Code

### 1. `src/shared/components/ui/SelectDialog.tsx` (custom select dialog)
Used in profile settings (gender, activity level, goal, weight unit, theme, rest timer).
- Panel: `border-zinc-200/70 bg-white` / `dark:border-white/6 dark:bg-[#141417]` — hardcoded `#141417` instead of token `--color-surface-dark-elevated`.
- Backdrop: `bg-black/50` — hardcoded black, not theme-aware.
- Option buttons:
  - Active: `bg-emerald-600 text-white` (hardcoded emerald).
  - Inactive: `bg-zinc-100 text-zinc-900 hover:bg-zinc-200` / `dark:bg-white/8 dark:text-white dark:hover:bg-white/12` — uses Tailwind colors, not design tokens.

### 2. `src/features/templates/components/ProgramCard.tsx` (Headless UI Menu)
Template actions menu (Edit, Duplicate, Delete).
- Menu.Items: `border-zinc-200/80 bg-white` / `dark:border-white/10 dark:bg-[#1c1c1f]` — hardcoded `#1c1c1f` (not a design token; between `--color-surface-dark` #0e0e10 and `--color-surface-dark-elevated` #141417).
- Menu items: `text-zinc-700 dark:text-zinc-200` with `active ? "bg-zinc-50 dark:bg-white/8"`.
- Delete item: `text-red-500` with `active ? "bg-red-50 dark:bg-red-500/10"`.

### 3. Native `<select>` in `src/features/meals/components/expert/CompetitionPrepCalculator.tsx` (line 70-77)
- `<select value={inputs.dailyActivity} onChange={...} className="w-full mt-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">`
- No `appearance: none` — browser default arrow icon shows, conflicting with app design.
- Options list is browser-default (not themeable).

### 4. Native `<select>` in `src/features/meals/components/expert/RawFoodMode.tsx` (lines 464-472, 482-497, 543-553)
Three native `<select>` elements (Preparation, Serving, Meal) with the same styling pattern as CompetitionPrepCalculator:
- `className="w-full rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"`
- No `appearance: none` — browser default arrow icon shows.

## Problem Solving
The back-button duplication was solved. For dropdowns, the issues identified:
1. Hardcoded hex colors (`#141417`, `#1c1c1f`, `bg-black/50`) instead of design tokens.
2. Native `<select>` elements lack `appearance: none`, so the browser-default arrow icon conflicts with the app's custom design.
3. Native `<select>` option lists are browser-default and not themeable.

## Pending Tasks and Next Steps
- [ ] Create a shared, theme-aware `Select` component (or style primitive) that replaces native `<select>` usage with a custom dropdown matching the design system.
- [ ] Update `SelectDialog` to use design tokens instead of hardcoded colors.
- [ ] Update `ProgramCard` Menu to use design tokens instead of hardcoded `#1c1c1f`.
- [ ] Replace native `<select>` in `CompetitionPrepCalculator.tsx` and `RawFoodMode.tsx` with the theme-aware custom select.
- [ ] Verify TypeScript compiles and the dropdowns work in both light and dark modes.
