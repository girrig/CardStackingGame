"use client";

import Card from "@/components/Card";
import { Card as CardType } from "@/types/card";
import { DragState } from "@/utils/dragUtils";
import {
  calculateGridPosition,
  calculateOptimalGridSize,
  initializeDragFromInventory,
  INVENTORY_GRID_CONFIG,
  sortCardsByQuantity,
} from "@/utils/inventoryUtils";
import { useEffect, useMemo, useRef, useState } from "react";

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
  // Track container size for responsive grid (initial size 6x4)
  const [containerSize, setContainerSize] = useState({
    width: 656,
    height: 568,
  });

  // Create ref for the component itself to measure its actual size
  const componentRef = useRef<HTMLDivElement>(null);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (componentRef.current) {
        const rect = componentRef.current.getBoundingClientRect();

        // Subtract padding (24px each side)
        const availableWidth = rect.width - 48;
        const availableHeight = rect.height - 48;

        // Calculate minimum dimensions for a usable 2x1 grid
        const minWidth =
          INVENTORY_GRID_CONFIG.slotGap +
          2 * (INVENTORY_GRID_CONFIG.slotWidth + INVENTORY_GRID_CONFIG.slotGap); // 224px for 2 cards
        const minHeight =
          INVENTORY_GRID_CONFIG.slotGap +
          1 *
            (INVENTORY_GRID_CONFIG.slotHeight + INVENTORY_GRID_CONFIG.slotGap); // 148px for 1 row

        const newSize = {
          width: Math.max(minWidth, availableWidth),
          height: Math.max(minHeight, availableHeight),
        };

        setContainerSize(newSize);
      }
    };

    // Use setTimeout to ensure DOM is ready (race condition)
    setTimeout(updateSize, 100);

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Calculate optimal grid dimensions based on available space
  const gridSize = useMemo(() => {
    const result = calculateOptimalGridSize(
      containerSize.width,
      containerSize.height,
      INVENTORY_GRID_CONFIG
    );
    return result;
  }, [containerSize]);

  // Sort inventory by quantity (highest to lowest)
  const sortedInventory = useMemo(
    () => sortCardsByQuantity(inventory),
    [inventory]
  );

  // Calculate positions for all cards
  const cardPositions = useMemo(() => {
    const positions = new Map<number, { x: number; y: number }>();
    sortedInventory.forEach((card, index) => {
      positions.set(
        card.id,
        calculateGridPosition(index, gridSize.cols, INVENTORY_GRID_CONFIG)
      );
    });
    return positions;
  }, [sortedInventory, gridSize.cols]);

  // Use the exact dimensions needed for the grid (no extra padding)
  const inventoryAreaWidth = gridSize.actualWidth;
  const inventoryAreaHeight = gridSize.actualHeight;

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
    <div ref={componentRef} className="w-full h-full">
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
        <div className="flex-1 flex justify-center items-center">
          <div
            className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            style={{
              height: inventoryAreaHeight,
              width: inventoryAreaWidth,
            }}
          >
            <div ref={inventoryAreaRef} className="relative w-full h-full">
              {/* Render grid slots */}
              {Array.from({ length: gridSize.totalSlots }, (_, index) => {
                const position = calculateGridPosition(
                  index,
                  gridSize.cols,
                  INVENTORY_GRID_CONFIG
                );
                return (
                  <div
                    key={`slot-${index}`}
                    className="absolute border border-gray-200 rounded opacity-30"
                    style={{
                      left: position.x,
                      top: position.y,
                      width: INVENTORY_GRID_CONFIG.slotWidth,
                      height: INVENTORY_GRID_CONFIG.slotHeight,
                    }}
                  />
                );
              })}

              {/* Render cards */}
              {sortedInventory.map((card, index) => {
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

              {sortedInventory.length === 0 && (
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
