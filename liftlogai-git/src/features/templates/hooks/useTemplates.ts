import { useEffect, useState } from "react";

import { TemplateRepository } from "../services/TemplateRepository";

import type {
  WorkoutTemplateDB,
} from "../../../database/types";

export function useTemplates() {
  const [templates, setTemplates] =
    useState<WorkoutTemplateDB[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function load() {
    setLoading(true);

    await TemplateRepository.seedDefaults();

    const data =
      await TemplateRepository.getAll();

    setTemplates(data);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return {
    templates,
    loading,
    reload: load,
  };
}