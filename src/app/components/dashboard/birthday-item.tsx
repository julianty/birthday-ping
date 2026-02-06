"use client";
import { useEffect, useState } from "react";

interface BirthdayItemProps {
  id: string;
  name: string;
  month: number;
  day: number;
  year: number;
}

function BirthdayItem({ id, name, month, day, year }: BirthdayItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [nameState, setNameState] = useState(name);
  const [dateState, setDateState] = useState(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${year}-${pad(month)}-${pad(day)}`;
  });
  const [saving, setSaving] = useState(false);

  // Debounced save for name
  useEffect(() => {
    if (nameState === name) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/birthdays/${id}`, {
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
  }, [nameState, id, name]);

  // Debounced save for date
  useEffect(() => {
    const initialDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateState === initialDate) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/birthdays/${id}`, {
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
  }, [dateState, id, month, day, year]);

  function finishEdit() {
    setEditMode(false);
    // ensure immediate save on blur: send a final PATCH
    fetch(`/api/birthdays/${id}`, {
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
        <div onClick={() => setEditMode(true)}>
          <span className="font-semibold">{nameState}</span> —{" "}
          <span>{`${month}/${day}/${year}`}</span>
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
