"use client";
import { useTransition } from "react";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onDelete,
  onCancel,
}: BulkActionBarProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await onDelete();
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-accent/95 backdrop-blur-md border-t border-accent-border px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <span className="font-semibold text-accent-foreground">
          {selectedCount} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-accent-foreground hover:bg-accent/80 font-medium disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium disabled:opacity-50 transition-colors"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
