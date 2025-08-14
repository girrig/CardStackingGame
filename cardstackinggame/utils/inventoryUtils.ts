import { CardType } from "@/types/card";

export const INVENTORY_GRID_CONFIG: any = {
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
  config: any
): {
  cols: number;
  rows: number;
  totalSlots: number;
  actualWidth: number;
  actualHeight: number;
} => {
  // Calculate how many cards can fit horizontally and vertically
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
export const sortCardsByQuantity = (cards: CardType[]): CardType[] => {
  return [...cards].sort((a, b) => b.quantity - a.quantity);
};

export const calculateGridPosition = (
  cardIndex: number,
  cols: number,
  config: any
) => {
  const row = Math.floor(cardIndex / cols);
  const col = cardIndex % cols;

  return {
    x: config.slotGap + col * (config.slotWidth + config.slotGap),
    y: config.slotGap + row * (config.slotHeight + config.slotGap),
  };
};
