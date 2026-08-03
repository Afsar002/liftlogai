import type { Transition, Variants } from "framer-motion";

const EASE_OUT_QUART: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Shared spring for micro-interactions (hover lifts, tab indicators). */
export const spring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
};

/** Entrance spring for content that fades/slides into view. */
export const entrance: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

/** Parent orchestrator for staggered lists/grids. */
export const listContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
};

/** Child of a staggered list — inherits orchestration from the container. */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: entrance,
  },
};

/** Dialog backdrop fade. */
export const dialogOverlay: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15, ease: EASE_OUT_QUART } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: "easeIn" } },
};

/** Dialog panel — scale + rise into place. */
export const dialogPanel: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

/** Magnetic hover — subtle cursor-follow effect. */
export const magnetic: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

/** Breathing pulse for live indicators (recording, active timer). */
export const breathing: Variants = {
  pulse: {
    scale: [1, 1.02, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

/** Page-level orchestrator — coordinates staggered entrance of page sections. */
export const pageOrchestrator: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Page section child — fades up with slight scale. */
export const pageSection: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 360, damping: 30, mass: 1 },
  },
};

/** Quick micro-interaction for button press / FAB. */
export const press: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

/** Smooth scroll-aware reveal for lists. */
export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 28, mass: 1.2 },
  },
};
