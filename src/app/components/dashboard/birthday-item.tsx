"use client";
import { useState } from "react";
import BirthdayItemModal from "./birthday-item-modal";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";

interface BirthdayItemProps {
  birthday: BirthdayPlainObject;
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

  const initial = nameState.charAt(0).toUpperCase();
  const dateLabel = `${MONTH_SHORT[dateState.getMonth()]} ${dateState.getUTCDate()}`;

  return (
    <li
      className="flex items-center gap-3 px-3 py-3 min-h-14 rounded-xl hover:bg-accent-subtle cursor-pointer transition-colors active:scale-[0.98]"
      onClick={() => setIsModalOpen(true)}
    >
      {/* Initial circle */}
      <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
        {initial}
      </div>

      {/* Name + group badge */}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-foreground block truncate">
          {nameState}
        </span>
        {groupNameState && (
          <span className="text-xs text-accent/70">{groupNameState}</span>
        )}
      </div>

      {/* Date chip */}
      <span className="text-xs font-medium text-muted bg-border/50 px-2.5 py-1 rounded-full whitespace-nowrap">
        {dateLabel}
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
