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
  if (!isOpen) return null;
  return createPortal(
    <div
      className="flex items-center justify-center fixed inset-0"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <button onClick={onClose}>x</button>
      <pre>{JSON.stringify(birthday)}</pre>
    </div>,
    document.body,
  );
}

export default BirthdayItemModal;
