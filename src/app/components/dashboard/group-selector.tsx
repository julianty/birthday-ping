"use client";

import { GroupDB } from "@/app/schemas/group.schema";
import { useState } from "react";

interface GroupSelectorProps {
  groups: GroupDB[];
  selectedGroupId?: string;
  onGroupChange: (groupId: string | null) => void;
  onCreateGroup: (name: string) => Promise<void>;
}

export function GroupSelector({
  groups,
  selectedGroupId,
  onGroupChange,
  onCreateGroup,
}: GroupSelectorProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateGroup(groupName);
      setGroupName("");
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="group-select" className="block text-sm font-medium">
        Group (optional)
      </label>
      <div className="flex gap-2">
        <select
          id="group-select"
          value={selectedGroupId || ""}
          onChange={(e) => onGroupChange(e.target.value || null)}
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        >
          <option value="">No group</option>
          {groups.map((group) => (
            <option key={group._id.toString()} value={group._id.toString()}>
              {group.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className="rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
        >
          + New
        </button>
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 mb-4"
                disabled={isCreating}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={isCreating || !groupName.trim()}
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
