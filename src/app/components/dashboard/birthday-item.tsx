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
  }

  return (
    <li className="mb-2">
      <div onClick={() => setIsModalOpen(true)}>
        <span className="block w-full px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
          {`${nameState}: ${dateState.getMonth() + 1}/${dateState.getUTCDate()}/${dateState.getFullYear()}`}
        </span>
        <BirthdayItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          birthday={birthday}
          onSaved={handleSaved}
        />
      </div>
    </li>
  );
}

export default BirthdayItem;
