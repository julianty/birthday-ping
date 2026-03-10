"use client";

import { useState, useEffect } from "react";

export interface GroupOption {
  _id: string;
  name: string;
}

interface GroupSelectProps {
  /** Currently selected group id (or undefined / empty for "no group") */
  value?: string;
  /** Called when the user picks a different group or clears selection */
  onChange: (groupId: string | null, groupName: string | null) => void;
  /** Extra CSS classes on the wrapper */
  className?: string;
}

export default function GroupSelect({
  value,
  onChange,
  className,
}: GroupSelectProps) {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showInlineCreate, setShowInlineCreate] = useState(false);

  // Fetch groups once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/groups");
        if (res.ok) {
          const data: GroupOption[] = await res.json();
          if (!cancelled) setGroups(data);
        }
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Create group failed");
      const created: GroupOption = await res.json();
      setGroups((prev) => [...prev, created]);
      onChange(created._id, created.name);
      setNewName("");
      setShowInlineCreate(false);
    } catch (err) {
      console.error("Failed to create group:", err);
    } finally {
      setCreating(false);
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === "__new__") {
      setShowInlineCreate(true);
      return;
    }
    if (v === "") {
      onChange(null, null);
    } else {
      const group = groups.find((g) => g._id === v);
      onChange(v, group?.name ?? null);
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">Group (optional)</label>
      <select
        value={value || ""}
        onChange={handleSelectChange}
        disabled={loading}
        className="w-full rounded border px-3 py-2"
      >
        <option value="">No group</option>
        {groups.map((g) => (
          <option key={g._id} value={g._id}>
            {g.name}
          </option>
        ))}
        <option value="__new__">+ Create new group…</option>
      </select>

      {showInlineCreate && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Group name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            className="flex-1 rounded border px-3 py-1 text-sm"
            disabled={creating}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? "…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInlineCreate(false);
              setNewName("");
            }}
            className="rounded px-2 py-1 text-sm text-zinc-500 hover:text-zinc-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
