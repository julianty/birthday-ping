"use client";
import React from "react";
import { createPortal } from "react-dom";

interface BirthdayItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function BirthdayItemModal({
  isOpen,
  onClose,
  children,
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
      {children}
    </div>,
    document.body,
  );
}

export default BirthdayItemModal;
