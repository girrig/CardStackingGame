"use client";

import Card from "@/components/Card";
import { Card as CardType } from "@/types/card";
import {
  calculateGridPosition,
  DragState,
  initializeDragFromInventory,
  INVENTORY_GRID_CONFIG,
} from "@/utils/dragUtils";
import { useEffect, useState } from "react";

const InventoryBox = ({
  inventoryAreaRef,
  setGlobalDragState,
  globalDragState,
  inventory,
  setInventory,
  cardDatabase,
}: {
  inventoryAreaRef: React.RefObject<HTMLDivElement | null>;
  globalDragState: DragState | null;
  setGlobalDragState: (state: DragState | null) => void;
  inventory: CardType[];
  setInventory: (
    inventory: CardType[] | ((prev: CardType[]) => CardType[])
  ) => void;
  cardDatabase: any;
}) => {
  // Card positions for grid layout
  const [cardPositions, setCardPositions] = useState<
    Map<number, { x: number; y: number }>
  >(new Map());

  const FIXED_ROWS = 3;

  // Calculate container dimensions
  const containerWidth =
    2 * INVENTORY_GRID_CONFIG.slotGap +
    INVENTORY_GRID_CONFIG.cardsPerRow * INVENTORY_GRID_CONFIG.slotWidth +
    (INVENTORY_GRID_CONFIG.cardsPerRow - 1) * INVENTORY_GRID_CONFIG.slotGap;
  const containerHeight =
    2 * INVENTORY_GRID_CONFIG.slotGap +
    FIXED_ROWS * INVENTORY_GRID_CONFIG.slotHeight +
    (FIXED_ROWS - 1) * INVENTORY_GRID_CONFIG.slotGap;

  // Initialize card positions in a grid layout
  useEffect(() => {
    setCardPositions((prev) => {
      const newMap = new Map(prev);
      inventory.forEach((card, index) => {
        newMap.set(
          card.id,
          calculateGridPosition(index, INVENTORY_GRID_CONFIG)
        );
      });
      return newMap;
    });
  }, [inventory]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, card: CardType) => {
    e.preventDefault();

    const { dragState } = initializeDragFromInventory(
      e,
      card,
      inventory,
      setInventory
    );

    setGlobalDragState(dragState);
  };

  return (
    <div className="flex-1">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Inventory</h2>
        <div className="flex justify-center">
          <div
            className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            style={{
              height: containerHeight,
              width: containerWidth,
            }}
          >
            <div
              ref={inventoryAreaRef}
              className="relative"
              style={{
                height: containerHeight,
                width: containerWidth,
              }}
            >
              {/* Render cards */}
              {inventory.map((card, index) => {
                const isBeingDragged =
                  globalDragState && globalDragState.cardId === card.id;
                const cardInfo = cardDatabase[card.type];
                if (!cardInfo) return null; // Skip rendering if card data not loaded yet

                const position = cardPositions.get(card.id);
                if (!position) return null;

                return (
                  <div
                    key={`card-${card.id}-${index}`}
                    className={`absolute ${
                      isBeingDragged ? "opacity-0" : "opacity-100"
                    }`}
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px)`,
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, card)}
                  >
                    <Card card={card} cardDatabase={cardDatabase} />
                  </div>
                );
              })}
              {inventory.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-20">
                  Your inventory is empty
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryBox;
