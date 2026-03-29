"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DangerZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  entityType: string;
  warningText?: string;
  isPending?: boolean;
}

export function DangerZoneModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  entityType,
  warningText = "This action cannot be undone.",
  isPending,
}: DangerZoneModalProps) {
  const [confirmText, setConfirmText] = useState("");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-destructive/20 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-destructive mb-2">Delete {entityType}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {warningText} Please type <strong className="text-foreground">{entityName}</strong> to confirm.
          </p>
          
          <Input 
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={entityName}
            className="mb-6"
            disabled={isPending}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={confirmText !== entityName || isPending}
              onClick={onConfirm}
            >
              {isPending ? "Deleting..." : "Permanently Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
