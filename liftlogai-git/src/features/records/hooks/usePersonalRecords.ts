import { useEffect, useState } from "react";

import { PersonalRecordRepository } from "../services/PersonalRecordRepository";
import type { PersonalRecord } from "../types";

export function usePersonalRecords() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecords() {
      try {
        const data = await PersonalRecordRepository.getAll();
        setRecords(data);
      } catch (error) {
        console.error("Failed to load personal records:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, []);

  return {
    records,
    loading,
  };
}