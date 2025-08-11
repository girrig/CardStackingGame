import { Card } from "@/types/card";
import { DragState, GridConfig } from "./dragUtils";

export const INVENTORY_GRID_CONFIG: GridConfig = {
  slotWidth: 100,
  slotHeight: 132,
  slotGap: 8,
  cardsPerRow: 8,
  containerBorder: 2,
};

export const calculateGridPosition = (
  cardIndex: number,
  config: GridConfig
) => {
  const row = Math.floor(cardIndex / config.cardsPerRow);
  const col = cardIndex % config.cardsPerRow;

  return {
    x: config.slotGap + col * (config.slotWidth + config.slotGap),
    y: config.slotGap + row * (config.slotHeight + config.slotGap),
  };
};

export const calculateDropIndex = (
  dropX: number,
  dropY: number,
  containerRect: DOMRect,
  config: GridConfig
): number => {
  // Convert to relative coordinates
  const relativeX = dropX - containerRect.left;
  const relativeY = dropY - containerRect.top;

  // Calculate grid column system
  const col = Math.max(
    0,
    Math.min(
      config.cardsPerRow - 1, // Max 7 (for 8 cards per row, 0-indexed)
      Math.round(
        (relativeX - config.slotGap) / (config.slotWidth + config.slotGap)
      )
    )
  );

  // Calculate grid row
  const row = Math.max(
    0,
    Math.round(
      (relativeY - config.slotGap) / (config.slotHeight + config.slotGap)
    )
  );

  // Return and covert to 1D array
  return row * config.cardsPerRow + col;
};

export const initializeDragFromInventory = (
  e: React.MouseEvent,
  card: Card,
  inventory: Card[],
  setInventory: (inventory: Card[] | ((prev: Card[]) => Card[])) => void
): { dragState: DragState; cardToDrag: Card } => {
  const cardElement = e.currentTarget as HTMLElement;
  const cardRect = cardElement.getBoundingClientRect();
  const offsetX = e.clientX - cardRect.left;
  const offsetY = e.clientY - cardRect.top;

  let cardToDrag = card;

  if (card.quantity > 1) {
    // Create new card with quantity 1 for dragging
    const newId = Math.max(...inventory.map((c) => c.id), 0) + 1;
    cardToDrag = {
      ...card,
      id: newId,
      quantity: 1,
      location: "inventory",
    };

    setInventory((prev: Card[]) =>
      prev.map((item) =>
        item.id === card.id ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  } else {
    // Move just the single card
    setInventory((prev: Card[]) => prev.filter((item) => item.id !== card.id));
  }

  const dragState: DragState = {
    cardId: cardToDrag.id,
    card: cardToDrag,
    startX: e.clientX,
    startY: e.clientY,
    currentX: e.clientX,
    currentY: e.clientY,
    offsetX,
    offsetY,
  };

  return { dragState, cardToDrag };
};

export const handleInventoryReorder = (
  dragState: DragState,
  dropX: number,
  dropY: number,
  inventory: any[],
  setInventory: any,
  inventoryAreaRef: React.RefObject<HTMLDivElement | null>
) => {
  if (!inventoryAreaRef.current) return;

  const rect = inventoryAreaRef.current.getBoundingClientRect();
  const targetIndex = calculateDropIndex(
    dropX,
    dropY,
    rect,
    INVENTORY_GRID_CONFIG
  );

  // Check if the card was removed from inventory during drag start
  const cardIndex = inventory.findIndex((card) => card.id === dragState.cardId);

  if (cardIndex !== -1) {
    // Card still exists in inventory, do normal reordering
    if (targetIndex !== cardIndex && targetIndex < inventory.length) {
      setInventory((prev: Card[]) => {
        const newInventory = [...prev];
        const [movedCard] = newInventory.splice(cardIndex, 1);
        newInventory.splice(targetIndex, 0, movedCard);
        return newInventory;
      });
    }
  } else {
    // Card was removed during drag start, restore it at the target position
    const existingStack = inventory.find(
      (item) => item.type === dragState.card.type
    );

    if (existingStack && dragState.card.quantity === 1) {
      // Add back to existing stack
      setInventory((prev: Card[]) =>
        prev.map((item) =>
          item.type === dragState.card.type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Insert the card at the target position
      setInventory((prev: Card[]) => {
        const newInventory = [...prev];
        const clampedIndex = Math.min(targetIndex, newInventory.length);
        newInventory.splice(clampedIndex, 0, dragState.card);
        return newInventory;
      });
    }
  }
};

export const handleDropToInventoryFromCombination = (
  card: any,
  inventory: any[],
  setInventory: any
) => {
  // Check for existing card stack
  const existingStack = inventory.find((item) => item.type === card.type);

  if (existingStack) {
    // Add to existing card stack
    setInventory((prev: Card[]) =>
      prev.map((item) =>
        item.type === card.type
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    // Create a new card stack
    const { dropX, dropY, ...cleanCard } = card;
    const newId = Math.max(...inventory.map((i) => i.id), 0) + 1;
    setInventory((prev: Card[]) => [
      ...prev,
      {
        ...cleanCard,
        id: newId,
        quantity: 1,
        location: "inventory",
      },
    ]);
  }
};
