import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../../../shared/components/layout/Layout";
import Card from "../../../shared/components/ui/Card";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Button from "../../../shared/components/ui/Button";
import Skeleton from "../../../shared/components/ui/Skeleton";
import EmptyState from "../../../shared/components/ui/EmptyState";

import { HistoryRepository } from "../repositories/HistoryRepository";
import type { WorkoutHistory } from "../models/WorkoutHistory";

import WeeklySummary from "../components/WeeklySummary";
import HistoryGroup from "../components/HistoryGroup";

import { calculateWeeklySummary } from "../services/calculateWeeklySummary";
import { groupHistoryByDate } from "../services/groupHistoryByDate";

import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";

export default function HistoryPage() {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);

  const summary = calculateWeeklySummary(history);
  const groups = groupHistoryByDate(history);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);

      const workouts = await HistoryRepository.getAll();
      setHistory(workouts);
    } catch (err) {
      console.error(err);
      setError("Failed to load workout history.");
      toast.error("Failed to load workout history.");
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClick(id: number) {
    setSelectedWorkoutId(id);
    setShowDeleteDialog(true);
  }

  async function confirmDelete() {
    if (selectedWorkoutId === null) return;

    await HistoryRepository.delete(selectedWorkoutId);

    toast.success("Workout deleted");

    setShowDeleteDialog(false);
    setSelectedWorkoutId(null);

    loadHistory();
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <PageHeader title="Workout History" />
          <Card>
            <div className="space-y-4 p-6">
              <Skeleton variant="text" className="h-6 w-32" />
              <Skeleton variant="text" className="h-4 w-48" />
              <Skeleton variant="rectangular" className="h-24" />
              <Skeleton variant="rectangular" className="h-24" />
              <Skeleton variant="rectangular" className="h-24" />
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <PageHeader title="Workout History" />
          <Card>
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <Button variant="secondary" onClick={loadHistory}>
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader title="Workout History" />

        <WeeklySummary summary={summary} />

        {history.length === 0 ? (
          <Card>
            <EmptyState
              icon="🏋️"
              title="No workouts yet"
              description="Complete your first workout to see your history here."
            />
          </Card>
        ) : (
          groups.map((group) => (
            <HistoryGroup
              key={group.title}
              group={group}
              onDelete={handleDeleteClick}
            />
          ))
        )}
        <ConfirmDialog
          open={showDeleteDialog}
          title="Delete Workout"
          description="This workout will be permanently removed. This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedWorkoutId(null);
          }}
        />
      </div>
    </Layout>
  );
}