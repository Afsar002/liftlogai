/* ------------------------------------------------------------------ */
/* Body Services - Unified Exports                                    */
/* ------------------------------------------------------------------ */

export * from "./WgerBodyService";
export * from "./UnifiedBodyService";

/* Re-export local types from UnifiedBodyService (defined there, not in WgerBodyService) */
export type {
  LocalWeightEntry,
  LocalMeasurement,
  LocalGalleryPhoto,
} from "./UnifiedBodyService";