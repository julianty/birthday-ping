"use client";
import { useState } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  selectedCount: number;
  birthdayNames: string[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  selectedCount,
  birthdayNames,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  // Show first few names
  const displayNames = birthdayNames.slice(0, 3);
  const hasMore = birthdayNames.length > 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-sm bg-background rounded-t-2xl sm:rounded-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Delete {selectedCount} birthday{selectedCount !== 1 ? "ies" : ""}?
          </h2>
          <p className="text-sm text-muted">
            This action cannot be undone. The following will be permanently
            deleted:
          </p>
        </div>

        {/* Birthday list preview */}
        <div className="space-y-1 max-h-40 overflow-y-auto bg-border/30 rounded-lg p-3">
          {displayNames.map((name) => (
            <div key={name} className="text-sm text-foreground truncate">
              • {name}
            </div>
          ))}
          {hasMore && (
            <div className="text-sm text-muted italic">
              + {birthdayNames.length - 3} more
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-border/30 text-foreground font-medium disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
