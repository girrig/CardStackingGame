import { CardType } from "@/types/card";
import { sortCardsByQuantity } from "./inventoryUtils";

export interface DragUtilsParams {
  inventory: CardType[];
  combinationAreaCards: CardType[];
  setInventory: React.Dispatch<React.SetStateAction<CardType[]>>;
  setCombinationAreaCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  combinationAreaRef: React.RefObject<HTMLDivElement | null>;
}

export const calculateRandomPosition = (
  containerElement: HTMLDivElement,
  cardWidth = 96,
  cardHeight = 128
) => {
  const rect = containerElement.getBoundingClientRect();
  const x = Math.max(
    0,
    Math.min(rect.width - cardWidth, Math.random() * (rect.width - cardWidth))
  );
  const y = Math.max(
    0,
    Math.min(
      rect.height - cardHeight,
      Math.random() * (rect.height - cardHeight)
    )
  );
  return { x, y };
};

export const calculateNewPosition = (
  containerElement: HTMLDivElement,
  currentX: number,
  currentY: number,
  deltaX: number,
  deltaY: number,
  cardWidth = 96,
  cardHeight = 128
) => {
  const rect = containerElement.getBoundingClientRect();
  const newX = Math.max(0, Math.min(rect.width - cardWidth, currentX + deltaX));
  const newY = Math.max(
    0,
    Math.min(rect.height - cardHeight, currentY + deltaY)
  );
  return { x: newX, y: newY };
};

export const moveCardFromCombinationToInventory = (
  card: CardType,
  { inventory, setInventory, setCombinationAreaCards }: DragUtilsParams
) => {
  const existingPile = inventory.find((item) => item.type === card.type);

  if (existingPile) {
    setInventory((prev: CardType[]) =>
      sortCardsByQuantity(
        prev.map((item) =>
          item.type === card.type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    );
  } else {
    const newId = Math.max(...inventory.map((i) => i.id), 0) + 1;
    setInventory((prev: CardType[]) =>
      sortCardsByQuantity([
        ...prev,
        {
          ...card,
          id: newId,
          quantity: 1,
          location: "inventory",
          x: undefined,
          y: undefined,
        },
      ])
    );
  }

  setCombinationAreaCards((prev: CardType[]) =>
    prev.filter((item) => item.id !== card.id)
  );
};

export const moveCardFromInventoryToCombination = (
  card: CardType,
  {
    combinationAreaCards,
    setInventory,
    setCombinationAreaCards,
    combinationAreaRef,
  }: DragUtilsParams
) => {
  const combinationAreaElement = combinationAreaRef.current;
  if (!combinationAreaElement) return;

  const { x, y } = calculateRandomPosition(combinationAreaElement);

  const newId =
    Math.max(...combinationAreaCards.map((c) => c.id), 0, card.id, 0) + 1;

  const newCard: CardType = {
    ...card,
    id: newId,
    quantity: 1,
    location: "combination",
    x,
    y,
  };

  setCombinationAreaCards((prev: CardType[]) => [...prev, newCard]);

  if (card.quantity > 1) {
    setInventory((prev: CardType[]) =>
      sortCardsByQuantity(
        prev.map((item) =>
          item.id === card.id ? { ...item, quantity: item.quantity - 1 } : item
        )
      )
    );
  } else {
    setInventory((prev: CardType[]) =>
      sortCardsByQuantity(prev.filter((item) => item.id !== card.id))
    );
  }
};

export const repositionCardInCombination = (
  card: CardType,
  deltaX: number,
  deltaY: number,
  {
    combinationAreaCards,
    setCombinationAreaCards,
    combinationAreaRef,
  }: DragUtilsParams
) => {
  const combinationAreaElement = combinationAreaRef.current;
  if (!combinationAreaElement) return;

  const currentCard = combinationAreaCards.find((c) => c.id === card.id);
  if (!currentCard) return;

  const { x: newX, y: newY } = calculateNewPosition(
    combinationAreaElement,
    currentCard.x || 0,
    currentCard.y || 0,
    deltaX,
    deltaY
  );

  setCombinationAreaCards((prev: CardType[]) =>
    prev.map((item) =>
      item.id === card.id ? { ...item, x: newX, y: newY } : item
    )
  );
};

export const handleCardDrop = (
  card: CardType,
  dropType: string,
  delta: { x: number; y: number },
  params: DragUtilsParams
) => {
  if (dropType === "inventory" && card.location === "combination") {
    moveCardFromCombinationToInventory(card, params);
  } else if (dropType === "combination") {
    if (card.location === "inventory") {
      moveCardFromInventoryToCombination(card, params);
    } else if (card.location === "combination") {
      repositionCardInCombination(card, delta.x, delta.y, params);
    }
  }
};
