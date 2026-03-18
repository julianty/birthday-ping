"use client";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import React, { useCallback, useState } from "react";
import BirthdayItem from "./birthday-item";
import BulkActionBar from "./bulk-action-bar";
import DeleteConfirmationModal from "./delete-confirmation-modal";

interface SubscriptionDisplayProps {
  birthdays: BirthdayPlainObject[];
  onSelectionModeChange?: (isSelectionMode: boolean) => void;
}

function SubscriptionDisplay({
  birthdays,
  onSelectionModeChange,
}: SubscriptionDisplayProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSelectChange = useCallback(
    (birthdayId: string, isSelected: boolean) => {
      setSelectedIds((prev) => {
        const updated = new Set(prev);
        if (isSelected) {
          updated.add(birthdayId);
        } else {
          updated.delete(birthdayId);
        }
        return updated;
      });
    },
    [],
  );

  const handleCancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    onSelectionModeChange?.(false);
    setSelectedIds(new Set());
  }, [onSelectionModeChange]);

  const handleDeleteClick = async () => {
    setShowDeleteConfirm(true);
  };

  const handleMoveToGroup = async (groupId: string | null) => {
    const birthdayIdsArray = Array.from(selectedIds);
    try {
      const response = await fetch("/api/subscriptions/bulk-assign-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthdayIds: birthdayIdsArray, groupId }),
      });

      if (!response.ok) {
        throw new Error("Failed to move birthdays");
      }

      handleCancelSelection();
      window.location.reload();
    } catch (error) {
      console.error("Move to group error:", error);
      alert("Failed to move birthdays to group");
    }
  };

  const handleConfirmDelete = async () => {
    const birthdayIdsArray = Array.from(selectedIds);
    try {
      const response = await fetch("/api/birthdays/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthdayIds: birthdayIdsArray }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete birthdays");
      }

      setShowDeleteConfirm(false);
      handleCancelSelection();

      // Reload the page to refresh the list
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete birthdays");
    }
  };

  const selectedBirthdayNames = Array.from(selectedIds)
    .map((id) => birthdays.find((b) => b._id === id)?.name)
    .filter(Boolean) as string[];
  // Build an ordered map: named groups (sorted A–Z) then ungrouped
  const groupMap = new Map<string | null, BirthdayPlainObject[]>();
  for (const birthday of birthdays) {
    const key = birthday.groupName ?? null;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(birthday);
  }

  const namedGroups = [...groupMap.entries()]
    .filter(([key]) => key !== null)
    .sort(([a], [b]) => a!.localeCompare(b!)) as [
    string,
    BirthdayPlainObject[],
  ][];

  const ungrouped = groupMap.get(null) ?? [];

  if (birthdays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <span className="text-3xl">🎂</span>
        </div>
        <h2 className="text-lg font-semibold mb-1">No birthdays yet</h2>
        <p className="text-muted text-sm">
          Tap the + button to add your first reminder.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isSelectionMode ? "pb-24" : ""}`}>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Birthdays</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">{birthdays.length} total</span>
          <button
            onClick={() => {
              const next = !isSelectionMode;
              setIsSelectionMode(next);
              onSelectionModeChange?.(next);
              if (!next) {
                setSelectedIds(new Set());
              }
            }}
            className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-accent-subtle text-accent transition-colors"
          >
            {isSelectionMode ? "Done" : "Select"}
          </button>
        </div>
      </div>

      {namedGroups.map(([groupName, items]) => (
        <section key={groupName}>
          <h2 className="sticky top-14 z-10 text-xs font-semibold uppercase tracking-widest text-muted px-3 py-2 bg-background/90 backdrop-blur-sm border-b border-border mb-1">
            {groupName}
          </h2>
          <ul className="space-y-1">
            {items.map((birthday) => (
              <BirthdayItem
                key={birthday._id}
                birthday={birthday}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(birthday._id)}
                onSelectChange={handleSelectChange}
              />
            ))}
          </ul>
        </section>
      ))}

      {ungrouped.length > 0 && (
        <section>
          {namedGroups.length > 0 && (
            <h2 className="sticky top-14 z-10 text-xs font-semibold uppercase tracking-widest text-muted px-3 py-2 bg-background/90 backdrop-blur-sm border-b border-border mb-1">
              Ungrouped
            </h2>
          )}
          <ul className="space-y-1">
            {ungrouped.map((birthday) => (
              <BirthdayItem
                key={birthday._id}
                birthday={birthday}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(birthday._id)}
                onSelectChange={handleSelectChange}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Bulk action bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onDelete={handleDeleteClick}
          onMoveToGroup={handleMoveToGroup}
          onCancel={handleCancelSelection}
        />
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        selectedCount={selectedIds.size}
        birthdayNames={selectedBirthdayNames}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

export default SubscriptionDisplay;
