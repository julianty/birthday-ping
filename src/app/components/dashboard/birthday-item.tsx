"use client";
import { useMemo, useState } from "react";
import BirthdayItemModal from "./birthday-item-modal";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import { formatBirthdayLabel } from "@/app/lib/date.utils";

interface BirthdayItemProps {
  birthday: BirthdayPlainObject;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectChange?: (birthdayId: string, isSelected: boolean) => void;
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

function BirthdayItem({ 
  birthday, 
  isSelectionMode, 
  isSelected, 
  onSelectChange 
}: BirthdayItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameState, setNameState] = useState(birthday.name);
  const [monthState, setMonthState] = useState(birthday.month);
  const [dayState, setDayState] = useState(birthday.day);
  const [yearState, setYearState] = useState<number | undefined>(birthday.year);
  const [groupNameState, setGroupNameState] = useState(
    birthday.groupName ?? null,
  );

  function handleSaved(updated: BirthdayPlainObject) {
    if (!updated) return;
    if (typeof updated.name === "string") setNameState(updated.name);
    if (typeof updated.month === "number") setMonthState(updated.month);
    if (typeof updated.day === "number") setDayState(updated.day);
    setYearState(updated.year);
    setGroupNameState(updated.groupName ?? null);
  }

  const initial = nameState.charAt(0).toUpperCase();
  const dateLabel = useMemo(() => {
    const monthLabel = MONTH_SHORT[Math.max(0, monthState - 1)] ?? "";
    const numericLabel = formatBirthdayLabel(monthState, dayState, yearState);
    const humanLabel = `${monthLabel} ${dayState}${yearState ? `, ${yearState}` : ""}`;

    return monthLabel ? humanLabel : numericLabel;
  }, [monthState, dayState, yearState]);

  const currentMonth = new Date().getMonth() + 1;
  const isCurrentMonthBirthday = monthState === currentMonth;

  return (
    <li
      className="flex items-center gap-3 px-3 py-3 min-h-14 rounded-xl hover:bg-accent-subtle cursor-pointer transition-colors active:scale-[0.98]"
      onClick={() => {
        if (isSelectionMode && onSelectChange) {
          onSelectChange(birthday._id, !isSelected);
        } else {
          setIsModalOpen(true);
        }
      }}
    >
      {/* Checkbox (selection mode) */}
      {isSelectionMode && (
        <input
          type="checkbox"
          checked={isSelected ?? false}
          onChange={(e) => {
            e.stopPropagation();
            onSelectChange?.(birthday._id, e.target.checked);
          }}
          className="w-5 h-5 rounded border-2 border-accent accent-accent shrink-0 cursor-pointer"
          aria-label={`Select ${nameState}`}
        />
      )}

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
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
          isCurrentMonthBirthday
            ? "text-success bg-success-subtle ring-1 ring-success-border"
            : "text-muted bg-border/50"
        }`}
      >
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
