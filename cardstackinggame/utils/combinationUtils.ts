import { Card } from "@/types/card";
import { DragState } from "./dragUtils";

export const calculateRelativePosition = (
  dropX: number,
  dropY: number,
  containerRect: DOMRect,
  offsetX: number,
  offsetY: number
) => {
  const containerBorder = 2; // border-2 class = 2px border
  return {
    x: dropX - containerRect.left - offsetX - containerBorder,
    y: dropY - containerRect.top - offsetY - containerBorder,
  };
};

export const initializeDragFromCombination = (
  e: React.MouseEvent,
  card: Card,
  setCombinationAreaCards: (cards: Card[] | ((prev: Card[]) => Card[])) => void
): DragState => {
  const cardElement = e.currentTarget as HTMLElement;
  const cardRect = cardElement.getBoundingClientRect();
  const offsetX = e.clientX - cardRect.left;
  const offsetY = e.clientY - cardRect.top;

  setCombinationAreaCards((prev: Card[]) =>
    prev.filter((item) => item.id !== card.id)
  );

  return {
    cardId: card.id,
    card,
    startX: e.clientX,
    startY: e.clientY,
    currentX: e.clientX,
    currentY: e.clientY,
    offsetX,
    offsetY,
  };
};

export const handleDropToCombination = (
  card: any,
  dropX: number,
  dropY: number,
  containerRect: DOMRect,
  offsetX: number,
  offsetY: number,
  combinationAreaCards: any[],
  setCombinationAreaCards: any,
  inventory: any[]
) => {
  const position = calculateRelativePosition(
    dropX,
    dropY,
    containerRect,
    offsetX,
    offsetY
  );

  const newId =
    Math.max(
      ...combinationAreaCards.map((c) => c.id),
      0,
      ...inventory.map((i) => i.id),
      card.id
    ) + 1;

  const newCard = {
    ...card,
    id: newId,
    quantity: 1,
    location: "combination",
    dropX: position.x,
    dropY: position.y,
  };

  setCombinationAreaCards((prev: Card[]) => [...prev, newCard]);
};

export const restoreCombinationCardAtPosition = (
  card: any,
  dropX: number,
  dropY: number,
  containerRect: DOMRect,
  offsetX: number,
  offsetY: number,
  setCombinationAreaCards: any
) => {
  const position = calculateRelativePosition(
    dropX,
    dropY,
    containerRect,
    offsetX,
    offsetY
  );

  setCombinationAreaCards((prev: Card[]) => [
    ...prev,
    {
      ...card,
      dropX: position.x,
      dropY: position.y,
    },
  ]);
};
