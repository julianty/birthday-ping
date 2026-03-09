"use client";
import { useState } from "react";
import BirthdayItemModal from "./birthday-item-modal";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";

interface BirthdayItemProps {
  birthday: BirthdayPlainObject;
}

function BirthdayItem({ birthday }: BirthdayItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialDate =
    birthday.date instanceof Date ? birthday.date : new Date(birthday.date);
  const [nameState, setNameState] = useState(birthday.name);
  const [dateState, setDateState] = useState(initialDate);
  const [groupNameState, setGroupNameState] = useState(
    birthday.groupName ?? null,
  );

  function handleSaved(updated: BirthdayPlainObject) {
    if (!updated) return;
    if (typeof updated.name === "string") setNameState(updated.name);
    if (updated.date) {
      const d =
        typeof updated.date === "string"
          ? new Date(updated.date)
          : updated.date;
      if (!Number.isNaN(d.getTime())) setDateState(d);
    }
    setGroupNameState(updated.groupName ?? null);
  }

  return (
    <li
      className="flex justify-between items-center mb-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
      onClick={() => setIsModalOpen(true)}
    >
      <span className="block px-2 py-1 rounded">{`${nameState}`}</span>
      <span className="flex items-center gap-2">
        {groupNameState && (
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400">
            {groupNameState}
          </span>
        )}
        <span className="block px-2 py-1 rounded">
          {`${dateState.getMonth() + 1}/${dateState.getUTCDate()}/${dateState.getFullYear()}`}
        </span>
      </span>
      <BirthdayItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        birthday={birthday}
        onSaved={handleSaved}
      />
    </li>
  );
}

export default BirthdayItem;
