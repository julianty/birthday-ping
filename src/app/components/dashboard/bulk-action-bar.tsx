"use client";
import { useEffect, useRef, useState, useTransition } from "react";

interface GroupOption {
  _id: string;
  name: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => Promise<void>;
  onMoveToGroup: (groupId: string | null) => Promise<void>;
  onCancel: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onDelete,
  onMoveToGroup,
  onCancel,
}: BulkActionBarProps) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isMovePending, startMoveTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [pickerGroupId, setPickerGroupId] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);

  const isPending = isDeletePending || isMovePending;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  const handleOpenMoveToGroup = async () => {
    setMenuOpen(false);
    if (groups.length === 0 && !groupsLoading) {
      setGroupsLoading(true);
      try {
        const res = await fetch("/api/groups");
        if (res.ok) {
          const data: GroupOption[] = await res.json();
          setGroups(data);
        }
      } finally {
        setGroupsLoading(false);
      }
    }
    setShowGroupPicker(true);
  };

  const handleOpenDelete = () => {
    setMenuOpen(false);
    startDeleteTransition(async () => {
      await onDelete();
    });
  };

  const handleCloseGroupPicker = () => {
    setShowGroupPicker(false);
    setPickerGroupId("");
  };

  const handleMove = () => {
    startMoveTransition(async () => {
      await onMoveToGroup(pickerGroupId === "" ? null : pickerGroupId);
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-accent/95 backdrop-blur-md border-t border-accent-border px-4 py-3 space-y-2">
      {/* Main action row */}
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <span className="font-semibold text-accent-foreground">
          {selectedCount} selected
        </span>
        <div className="flex gap-2 items-center">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-accent-foreground hover:bg-accent/80 font-medium disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>

          {/* Bulk Actions button + context menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-background/20 text-accent-foreground hover:bg-background/30 font-medium disabled:opacity-50 transition-colors"
            >
              Bulk Actions
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-card rounded-xl shadow-lg border border-border overflow-hidden py-1 z-50">
                <button
                  onClick={handleOpenMoveToGroup}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent-subtle transition-colors text-left"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-accent"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  Move to group
                </button>
                <div className="mx-3 border-t border-border" />
                <button
                  onClick={handleOpenDelete}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline group picker row */}
      {showGroupPicker && (
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <select
            value={pickerGroupId}
            onChange={(e) => setPickerGroupId(e.target.value)}
            disabled={groupsLoading || isMovePending}
            className="flex-1 rounded-lg border border-background/30 bg-background/20 text-accent-foreground px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">No group (ungrouped)</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleMove}
            disabled={groupsLoading || isMovePending}
            className="px-4 py-2 rounded-lg bg-background/20 text-accent-foreground hover:bg-background/30 font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isMovePending ? "Moving…" : "Move"}
          </button>
          <button
            onClick={handleCloseGroupPicker}
            disabled={isMovePending}
            className="px-3 py-2 rounded-lg text-accent-foreground/70 hover:text-accent-foreground font-medium disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

