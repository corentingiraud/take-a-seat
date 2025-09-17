"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PrepaidCard } from "@/models/prepaid-card";

type Props = {
  cards: PrepaidCard[];
  value: PrepaidCard | null;
  onChange: (card: PrepaidCard | null) => void;
  placeholder?: string;
  disabled?: boolean;
  autoSelectBest?: boolean;
};

export default function PrepaidCardSelect({
  cards,
  value,
  onChange,
  placeholder = "Sélectionnez une carte prépayée",
  disabled,
  autoSelectBest = true,
}: Props) {
  const bestCard = useMemo(() => {
    if (!cards?.length) return null;
    if (cards.length === 1) return cards[0];

    return cards.reduce((max, c) =>
      c.remainingBalance > max.remainingBalance ? c : max,
    );
  }, [cards]);

  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (value?.documentId) {
      setSelectedId(value.documentId);

      return;
    }
    if (autoSelectBest && bestCard?.documentId) {
      setSelectedId(bestCard.documentId);
      if (!value) onChange(bestCard);

      return;
    }
    setSelectedId("");
    if (value) onChange(null);
  }, [value, bestCard, autoSelectBest, onChange]);

  useEffect(() => {
    if (!selectedId) return;
    if (!cards.some((c) => c.documentId === selectedId)) {
      setSelectedId("");
      if (value) onChange(null);
    }
  }, [cards, selectedId, value, onChange]);

  if (!cards || cards.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune carte prépayée disponible.
      </p>
    );
  }

  return (
    <Select
      disabled={disabled}
      value={selectedId}
      onValueChange={(val) => {
        setSelectedId(val);
        const card = cards.find((c) => c.documentId === val) || null;

        onChange(card);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {cards.map((card) => (
          <SelectItem key={card.documentId} value={card.documentId}>
            {card.toString()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
