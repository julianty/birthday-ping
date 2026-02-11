"use client";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import React from "react";
import { createPortal } from "react-dom";

interface BirthdayItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthday: BirthdayPlainObject;
}

function BirthdayItemModal({
  isOpen,
  onClose,
  birthday,
}: BirthdayItemModalProps) {
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");

  React.useEffect(() => {
    if (birthday) {
      const year = birthday.date.getFullYear();
      setName(birthday.name ?? "");
      const pad = (n: number) => String(n).padStart(2, "0");
      if (year && birthday.month && birthday.day) {
        setDate(`${year}-${pad(birthday.month)}-${pad(birthday.day)}`);
      } else if (birthday.date) {
        setDate(birthday.date.toString());
      } else {
        setDate("");
      }
    }
  }, [birthday]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("submit");
  };
  return createPortal(
    <div
      className="flex items-center justify-center fixed inset-0 bg-gray-800/30"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="bg-background">
        <button onClick={onClose}>x</button>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-1">
            <label className="text-sm font-medium">Name</label>
            <input
              className="px-3 py-2 rounded border"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="name"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-1">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="px-3 py-2 rounded border"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="date"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-3 py-2 rounded bg-gray-200 dark:bg-zinc-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded bg-indigo-600 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default BirthdayItemModal;
