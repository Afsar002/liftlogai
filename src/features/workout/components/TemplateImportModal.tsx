/* ------------------------------------------------------------------ */
/* Template Import Modal                                              */
/* ------------------------------------------------------------------ */
/* Allows users to browse and import community workout templates      */
/* from wger. Uses UnifiedTemplateService for searching and importing.*/
/* ------------------------------------------------------------------ */

import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiDownload, FiX, FiInfo, FiExternalLink, FiFilter, FiGrid, FiList } from "react-icons/fi";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '../../../shared/lib/cn';
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import Select from "../../../shared/components/ui/Select";
import { AnimatedOverlay, AnimatedPanel } from "../../../shared/components/motion/AnimatedDialog";
import { searchPublicTemplates, importWgerTemplate, type WgerTemplate } from "../services/UnifiedTemplateService";

interface TemplateImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface Option<T extends string | number> {
  label: string;
  value: T;
}

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

const sortOptions: Option<string>[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Newest", value: "newest" },
  { label: "Most Exercises", value: "exercises" },
  { label: "Most Days", value: "days" },
];

export default function TemplateImportModal({ open, onClose, onImportSuccess }: TemplateImportModalProps) {
  const [templates, setTemplates] = useState<WgerTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WgerTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTemplate, setSelectedTemplate] = useState<WgerTemplate | null>(null);
  const [importing, setImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load templates on mount
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchPublicTemplates("");
      setTemplates(results);
      setFilteredTemplates(results);
    } catch (err) {
      setError("Failed to load templates. Please try again.");
      console.error("[TemplateImportModal] Load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, loadTemplates]);

  // Filter and sort templates
  useEffect(() => {
    let result = [...templates];

    // Search filter
    if (query.trim()) {
      const tokens = query.toLowerCase().trim().split(/\s+/);
      result = result.filter((template) => {
        const haystack = `${template.name} ${template.description} ${template.author}`.toLowerCase();
        return tokens.every((token) => haystack.includes(token));
      });
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "exercises":
        result.sort((a, b) => b.totalExercises - a.totalExercises);
        break;
      case "days":
        result.sort((a, b) => b.dayCount - a.dayCount);
        break;
      default:
        // Relevance - already sorted by API or keep original order
        break;
    }

    setFilteredTemplates(result);
  }, [templates, query, sortBy]);

  const handleImport = async (template: WgerTemplate) => {
    setImporting(true);
    try {
      await importWgerTemplate(template);
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      console.error("[TemplateImportModal] Import error:", err);
      alert("Failed to import template. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const handlePreview = (template: WgerTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <Dialog open={open} onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <AnimatedOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <AnimatedPanel className="w-full max-w-5xl max-h-[90vh] flex flex-col">
            <DialogPanel
              className={cn(
                "w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl",
                "border-zinc-200/70 bg-white",
                "dark:border-white/10 dark:bg-surface-dark-elevated",
                "overflow-hidden"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200/70 px-5 py-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <FiGrid size={24} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <div>
                    <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white">
                      Import Templates
                    </DialogTitle>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Browse 1000+ community workouts from wger
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={<FiX size={18} aria-hidden="true" />}
                  onClick={onClose}
                  aria-label="Close modal"
                  className="dark:hover:bg-white/10"
                />
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-zinc-200/70 dark:border-white/10">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search templates... (e.g., push pull legs, upper lower, strength)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent dark:bg-[#141417] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
                    aria-label="Search templates"
                  />
                </div>

                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  options={sortOptions}
                  ariaLabel="Sort templates"
                  className="w-full sm:w-40"
                />

                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "grid"
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
                    )}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <FiGrid size={18} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "list"
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
                    )}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <FiList size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-auto p-4">
                {loading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                      <Card key={i} padding="none" variant="outlined" className="animate-pulse">
                        <div className="aspect-[4/3] bg-zinc-200/50 dark:bg-white/5" />
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-zinc-200/50 dark:bg-white/5 rounded w-3/4" />
                          <div className="h-3 bg-zinc-200/50 dark:bg-white/5 rounded w-1/2" />
                          <div className="h-3 bg-zinc-200/50 dark:bg-white/5 rounded w-full" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FiInfo size={48} className="text-zinc-400 dark:text-zinc-500 mb-3" aria-hidden="true" />
                    <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
                    <Button variant="outline" onClick={loadTemplates} className="mt-4">
                      Try Again
                    </Button>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FiFilter size={48} className="text-zinc-400 dark:text-zinc-500 mb-3" aria-hidden="true" />
                    <p className="text-zinc-600 dark:text-zinc-400">No templates found</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  viewMode === "grid" ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onImport={handleImport}
                          onPreview={handlePreview}
                          loading={importing}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTemplates.map((template) => (
                        <TemplateListItem
                          key={template.id}
                          template={template}
                          onImport={handleImport}
                          onPreview={handlePreview}
                          loading={importing}
                        />
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* Footer - Template Count */}
              <div className="px-4 py-3 border-t border-zinc-200/70 dark:border-white/10">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                  Showing {filteredTemplates.length} of {templates.length} templates
                </p>
              </div>
            </DialogPanel>
          </AnimatedPanel>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && selectedTemplate && (
            <TemplatePreviewModal
              template={selectedTemplate}
              onClose={handleClosePreview}
              onImport={handleImport}
              loading={importing}
            />
          )}
        </AnimatePresence>
      </Dialog>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Template Card (Grid View)                                          */
/* ------------------------------------------------------------------ */

interface TemplateCardProps {
  template: WgerTemplate;
  onImport: (template: WgerTemplate) => void;
  onPreview: (template: WgerTemplate) => void;
  loading: boolean;
}

function TemplateCard({ template, onImport, onPreview, loading }: TemplateCardProps) {
  return (
    <Card
      variant="outlined"
      padding="none"
      hover
      pressable
      className="flex flex-col h-full transition-all duration-200"
    >
      {/* Thumbnail / Header */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-500/10 to-lime-400/10 dark:from-emerald-500/20 dark:to-lime-400/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <FiGrid size={32} className="text-emerald-500/50 dark:text-emerald-400/50" aria-hidden="true" />
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => onPreview(template)}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-white hover:text-zinc-900 dark:hover:bg-white/20 dark:hover:text-white transition-colors"
            aria-label="Preview template"
          >
            <FiInfo size={14} aria-hidden="true" />
          </button>
          <button
            onClick={() => onImport(template)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            aria-label="Import template"
          >
            <FiDownload size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-zinc-900 dark:text-white truncate pr-2">
            {template.name}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
            {template.source === "wger-public" ? "Community" : "wger"}
          </span>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 flex-1">
          {template.description || "No description available"}
        </p>

        <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/70 dark:border-white/10 pt-3">
          <span className="flex items-center gap-1">
            <FiExternalLink size={12} aria-hidden="true" />
            By {template.author}
          </span>
          <span className="flex items-center gap-1">
            <FiGrid size={12} aria-hidden="true" />
            {template.dayCount} day{template.dayCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <FiList size={12} aria-hidden="true" />
            {template.totalExercises} exercise{template.totalExercises !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Template List Item (List View)                                     */
/* ------------------------------------------------------------------ */

interface TemplateListItemProps {
  template: WgerTemplate;
  onImport: (template: WgerTemplate) => void;
  onPreview: (template: WgerTemplate) => void;
  loading: boolean;
}

function TemplateListItem({ template, onImport, onPreview, loading }: TemplateListItemProps) {
  return (
    <Card variant="outlined" padding="none" hover className="overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-500/10 to-lime-400/10 dark:from-emerald-500/20 dark:to-lime-400/20 flex items-center justify-center">
          <FiGrid size={24} className="text-emerald-500/50 dark:text-emerald-400/50" aria-hidden="true" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
              {template.name}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
              {template.source === "wger-public" ? "Community" : "wger"}
            </span>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
            {template.description || "No description available"}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            <span className="flex items-center gap-1">
              <FiExternalLink size={10} aria-hidden="true" />
              By {template.author}
            </span>
            <span className="flex items-center gap-1">
              <FiGrid size={10} aria-hidden="true" />
              {template.dayCount} day{template.dayCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <FiList size={10} aria-hidden="true" />
              {template.totalExercises} exercise{template.totalExercises !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            icon={<FiInfo size={16} aria-hidden="true" />}
            onClick={() => onPreview(template)}
            aria-label="Preview template"
            className="dark:hover:bg-white/10"
          />
          <Button
            variant="primary"
            size="sm"
            icon={<FiDownload size={16} aria-hidden="true" />}
            onClick={() => onImport(template)}
            disabled={loading}
            loading={loading}
            aria-label="Import template"
          >
            Import
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Template Preview Modal                                             */
/* ------------------------------------------------------------------ */

interface TemplatePreviewModalProps {
  template: WgerTemplate;
  onClose: () => void;
  onImport: (template: WgerTemplate) => void;
  loading: boolean;
}

function TemplatePreviewModal({ template, onClose, onImport, loading }: TemplatePreviewModalProps) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <AnimatedOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <AnimatedPanel className="w-full max-w-2xl max-h-[80vh]">
          <DialogPanel
            className={cn(
              "w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden",
              "border-zinc-200/70 bg-white",
              "dark:border-white/10 dark:bg-surface-dark-elevated"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-200/70 px-5 py-4 dark:border-white/10">
              <div className="flex-1 pr-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {template.name}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  By {template.author} · {template.dayCount} day{template.dayCount !== 1 ? "s" : ""} · {template.totalExercises} exercise{template.totalExercises !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<FiX size={18} aria-hidden="true" />}
                onClick={onClose}
                aria-label="Close preview"
                className="dark:hover:bg-white/10"
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5 space-y-4">
              {template.description && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Description</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {template.description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Exercises</h3>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {template.exercises.map((ex, index) => {
                    const englishName = ex.exercise_detail.translations.find(t => t.language === 2)?.name?.trim() ?? `Exercise ${ex.exercise}`;
                    return (
                      <div
                        key={ex.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200/50 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 font-bold text-sm shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-white truncate">{englishName}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {ex.sets} × {ex.reps} · {ex.rest_time}s rest
                          </p>
                        </div>
                        {ex.note && (
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                            Note
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-200/70 px-5 py-4 dark:border-white/10">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="gradient"
                size="lg"
                icon={<FiDownload size={18} aria-hidden="true" />}
                onClick={() => onImport(template)}
                disabled={loading}
                loading={loading}
              >
                Import Template
              </Button>
            </div>
          </DialogPanel>
        </AnimatedPanel>
      </div>
    </Dialog>
  );
}