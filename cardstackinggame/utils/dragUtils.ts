import { Card } from "@/types/card";

export interface DragState {
  cardId: number;
  card: Card;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
}

export interface DropZone {
  ref: React.RefObject<HTMLDivElement | null>;
  type: "inventory" | "combination";
}

export interface GridConfig {
  slotWidth: number;
  slotHeight: number;
  slotGap: number;
  cardsPerRow: number;
  containerBorder: number;
}

export const detectDropZone = (
  mouseX: number,
  mouseY: number,
  dropZones: DropZone[]
): DropZone | null => {
  for (const zone of dropZones) {
    if (zone.ref.current) {
      const rect = zone.ref.current.getBoundingClientRect();
      if (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      ) {
        return zone;
      }
    }
  }
  return null;
};

export const handleInvalidDropRestore = (
  dragState: DragState,
  inventory: any[],
  setInventory: any,
  combinationAreaCards: any[],
  setCombinationAreaCards: any
) => {
  if (dragState.card.location === "combination") {
    setCombinationAreaCards((prev: Card[]) => [...prev, dragState.card]);
  } else {
    const wasRemovedFromInventory = !inventory.some(
      (item) => item.id === dragState.card.id
    );
    const isNotInCombination = !combinationAreaCards.some(
      (item) => item.id === dragState.card.id
    );

    if (wasRemovedFromInventory && isNotInCombination) {
      const existingPile = inventory.find(
        (item) => item.type === dragState.card.type
      );

      if (existingPile) {
        setInventory((prev: Card[]) =>
          prev.map((item) =>
            item.type === dragState.card.type
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setInventory((prev: Card[]) => [...prev, dragState.card]);
      }
    }
  }
};
