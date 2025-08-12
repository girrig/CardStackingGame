import { Card } from "@/types/card";
import { DragState, GridConfig } from "./dragUtils";

export const INVENTORY_GRID_CONFIG: GridConfig = {
  slotWidth: 100,
  slotHeight: 132,
  slotGap: 8,
  cardsPerRow: 8,
  containerBorder: 2,
};

// Calculate optimal grid dimensions based on container size
export const calculateOptimalGridSize = (
  containerWidth: number,
  containerHeight: number,
  config: GridConfig
): {
  cols: number;
  rows: number;
  totalSlots: number;
  actualWidth: number;
  actualHeight: number;
} => {
  // Calculate how many cards can fit horizontally and vertically
  // For columns: containerWidth = 2*slotGap + cols*slotWidth + (cols-1)*slotGap
  // Simplified: containerWidth = slotGap + cols*(slotWidth + slotGap)
  // Solving for cols: cols = (containerWidth - slotGap) / (slotWidth + slotGap)
  const maxCols = Math.floor(
    (containerWidth - config.slotGap) / (config.slotWidth + config.slotGap)
  );
  const maxRows = Math.floor(
    (containerHeight - config.slotGap) / (config.slotHeight + config.slotGap)
  );

  // Ensure minimum of 1x1 grid
  const cols = Math.max(1, maxCols);
  const rows = Math.max(1, maxRows);

  // Calculate the actual dimensions that will use the maximum space
  const actualWidth =
    2 * config.slotGap + cols * config.slotWidth + (cols - 1) * config.slotGap;
  const actualHeight =
    2 * config.slotGap + rows * config.slotHeight + (rows - 1) * config.slotGap;

  return {
    cols,
    rows,
    totalSlots: cols * rows,
    actualWidth,
    actualHeight,
  };
};

// Sort cards by quantity (highest to lowest)
export const sortCardsByQuantity = (cards: Card[]): Card[] => {
  return [...cards].sort((a, b) => b.quantity - a.quantity);
};

export const calculateGridPosition = (
  cardIndex: number,
  cols: number,
  config: GridConfig
) => {
  const row = Math.floor(cardIndex / cols);
  const col = cardIndex % cols;

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
  inventory: Card[],
  setInventory: (inventory: Card[] | ((prev: Card[]) => Card[])) => void
) => {
  // Just restore the card to its proper sorted position
  const existingPile = inventory.find(
    (item) => item.type === dragState.card.type
  );

  if (existingPile && dragState.card.quantity === 1) {
    // Add back to existing pile
    setInventory((prev: Card[]) =>
      prev.map((item) =>
        item.type === dragState.card.type
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    // Add card back to inventory (it will be sorted automatically)
    setInventory((prev: Card[]) => [...prev, dragState.card]);
  }
};

export const handleDropToInventoryFromCombination = (
  card: any,
  inventory: any[],
  setInventory: any
) => {
  // Check for existing card pile
  const existingPile = inventory.find((item) => item.type === card.type);

  if (existingPile) {
    // Add to existing card pile
    setInventory((prev: Card[]) =>
      prev.map((item) =>
        item.type === card.type
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    // Create a new card pile
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
