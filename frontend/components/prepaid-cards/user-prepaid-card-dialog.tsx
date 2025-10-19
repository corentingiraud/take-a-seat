"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import PrepaidCardSelect from "@/components/prepaid-cards/select";
import { usePrepaidCard } from "@/hooks/use-prepaid-card";
import { PrepaidCard } from "@/models/prepaid-card";

type Props = {
  userDocumentId?: string;
  minCredits?: number;
  selectionLabel?: string;
  disabled?: boolean;
  autoSelectBest?: boolean;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  trigger?: React.ReactNode;

  onConfirm: (card: PrepaidCard) => Promise<void> | void;
};

export function UserPrepaidCardDialog({
  userDocumentId,
  minCredits = 0,
  selectionLabel,
  disabled,
  autoSelectBest = true,
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  const [selectedCard, setSelectedCard] = useState<PrepaidCard | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { usablePrepaidCards, isLoading } = usePrepaidCard({
    userDocumentId,
  });

  const eligibleCards = useMemo(
    () =>
      (usablePrepaidCards ?? []).filter(
        (c) => (c.remainingBalance ?? 0) >= minCredits,
      ),
    [usablePrepaidCards, minCredits],
  );

  useEffect(() => {
    if (!autoSelectBest) return;
    if (!eligibleCards.length) {
      setSelectedCard(null);

      return;
    }
    const best = [...eligibleCards].sort(
      (a, b) => (a.remainingBalance ?? 0) - (b.remainingBalance ?? 0),
    )[0];

    setSelectedCard((prev) => prev ?? best);
  }, [autoSelectBest, eligibleCards]);

  const handleConfirm = async () => {
    if (!selectedCard) return;
    try {
      setSubmitting(true);
      await onConfirm(selectedCard);
      onOpenChange?.(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sélectionner une carte pré-payée.</DialogTitle>
          <DialogDescription>
            {selectionLabel ??
              (minCredits > 0
                ? `Choisissez une carte avec au moins ${minCredits} crédit(s).`
                : `Choisissez une carte prépayée.`)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <PrepaidCardSelect
            autoSelectBest={autoSelectBest}
            cards={eligibleCards}
            disabled={disabled || isLoading || submitting}
            placeholder={
              isLoading
                ? "Chargement des cartes…"
                : "Sélectionnez une carte (obligatoire)"
            }
            value={selectedCard}
            onChange={setSelectedCard}
          />
          {!isLoading && eligibleCards.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Aucune carte ne possède assez de crédits
              {minCredits > 0 ? ` (min. ${minCredits})` : ""}.
            </p>
          )}
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button
              disabled={submitting}
              variant="secondary"
              onClick={() => onOpenChange?.(false)}
            >
              Annuler
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              disabled={!selectedCard || submitting || disabled}
              onClick={handleConfirm}
            >
              {submitting ? "Traitement…" : "Confirmer"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
