import Card from "./Card";
import Button from "./Button";
import { AnimatedOverlay, AnimatedPanel } from "../motion/AnimatedDialog";
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;

  confirmText?: string;
  cancelText?: string;

  variant?: "default" | "danger";

  loading?: boolean;

  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <AnimatedOverlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <AnimatedPanel className="w-full max-w-md">
        <Card>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {title}
          </h2>

          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>

            <Button
              variant={
                variant === "danger"
                  ? "danger"
                  : "primary"
              }
              onClick={onConfirm}
              disabled={loading}
            >
              {confirmText}
            </Button>
          </div>
        </Card>
      </AnimatedPanel>
    </AnimatedOverlay>
  );
}