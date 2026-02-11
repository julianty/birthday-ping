"use client";
import { useState } from "react";
import BirthdayItemModal from "./birthday-item-modal";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";

interface BirthdayItemProps {
  birthday: BirthdayPlainObject;
}

function BirthdayItem({ birthday }: BirthdayItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <li className="mb-2">
      <div onClick={() => setIsModalOpen(true)}>
        <span>{`${birthday.name}: ${birthday.month}/${birthday.day}/${birthday.date.getFullYear()}`}</span>
        <BirthdayItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          birthday={birthday}
        />
      </div>
    </li>
  );
}

export default BirthdayItem;
