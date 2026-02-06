"use client";
import { useEffect, useState } from "react";
import BirthdayItemModal from "./birthday-item-modal";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import { id } from "zod/locales";

interface BirthdayItemProps {
  birthday: BirthdayPlainObject;
}

function BirthdayItem({ birthday }: BirthdayItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [nameState, setNameState] = useState(birthday.name);
  const [dateState, setDateState] = useState(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${birthday.date.getFullYear()}-${pad(birthday.month)}-${pad(birthday.day)}`;
  });
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounced save for name
  useEffect(() => {
    if (nameState === birthday.name) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/birthdays/${birthday._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nameState }),
          signal: controller.signal,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          /* show error / rollback */
        }
      } finally {
        setSaving(false);
      }
    }, 500);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [nameState, birthday]);

  // Debounced save for date
  useEffect(() => {
    const initialDate = `${birthday.date.getFullYear()}-${String(birthday.month).padStart(2, "0")}-${String(birthday.day).padStart(2, "0")}`;
    if (dateState === initialDate) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/birthdays/${birthday._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateState }),
          signal: controller.signal,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          /* show error / rollback */
        }
      } finally {
        setSaving(false);
      }
    }, 700);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [dateState, birthday]);

  function finishEdit() {
    setEditMode(false);
    // ensure immediate save on blur: send a final PATCH
    fetch(`/api/birthdays/${birthday._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameState, date: dateState }),
    }).catch(() => {
      /* handle error */
    });
  }

  return (
    <li className="mb-2">
      {!editMode ? (
        <div onClick={() => setIsModalOpen(true)}>
          <span className="font-semibold">{nameState}</span> —{" "}
          <span>{`${birthday.month}/${birthday.day}/${birthday.date.getFullYear()}`}</span>
          <BirthdayItemModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            birthday={birthday}
          />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            finishEdit();
          }}
          className="flex gap-2 items-center"
        >
          <input
            value={nameState}
            onChange={(e) => setNameState(e.target.value)}
            onBlur={finishEdit}
            className="px-2 py-1 rounded border"
            aria-label="name"
          />
          <input
            type="date"
            value={dateState}
            onChange={(e) => setDateState(e.target.value)}
            onBlur={finishEdit}
            className="px-2 py-1 rounded border"
            aria-label="date"
          />
          {saving && <span className="text-xs text-zinc-400">Saving…</span>}
        </form>
      )}
    </li>
  );
}

export default BirthdayItem;
