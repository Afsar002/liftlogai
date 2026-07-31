import Card from "./Card";
import Button from "./Button";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="mt-3 text-sm text-gray-400">
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
    </div>
  );
}