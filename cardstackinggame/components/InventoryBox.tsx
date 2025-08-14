"use client";

import Card from "@/components/Card";
import { CardType } from "@/types/card";
import {
  calculateGridPosition,
  calculateOptimalGridSize,
  INVENTORY_GRID_CONFIG,
} from "@/utils/inventoryUtils";
import { useDroppable } from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";

const InventoryBox = ({
  inventoryAreaRef,
  inventory,
  cardDatabase,
}: {
  inventoryAreaRef: React.RefObject<HTMLDivElement | null>;
  inventory: CardType[];
  cardDatabase: any;
}) => {
  // Track container size for responsive grid
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Create ref for the component itself to measure its actual size
  const componentRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: "inventory",
    data: {
      type: "inventory",
    },
  });

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
    if (!containerSize) return null;
    const result = calculateOptimalGridSize(
      containerSize.width,
      containerSize.height,
      INVENTORY_GRID_CONFIG
    );
    return result;
  }, [containerSize]);

  // Inventory is now already sorted from state updates

  // Calculate positions for all cards
  const cardPositions = useMemo(() => {
    if (!gridSize) return new Map<number, { x: number; y: number }>();
    const positions = new Map<number, { x: number; y: number }>();
    inventory.forEach((card, index) => {
      positions.set(
        card.id,
        calculateGridPosition(index, gridSize.cols, INVENTORY_GRID_CONFIG)
      );
    });
    return positions;
  }, [inventory, gridSize]);

  // Use the exact dimensions needed for the grid (no extra padding)
  const inventoryAreaWidth = gridSize?.actualWidth;
  const inventoryAreaHeight = gridSize?.actualHeight;

  return (
    <div ref={componentRef} className="w-full h-full">
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
        <div className="flex-1 flex justify-center items-center">
          {!gridSize ? (
            <div className="text-gray-500">Loading inventory...</div>
          ) : (
            <div
              ref={(node) => {
                setNodeRef(node);
                if (inventoryAreaRef) {
                  inventoryAreaRef.current = node;
                }
              }}
              className={`relative border-2 border-dashed rounded-lg overflow-hidden bg-gray-50 border-gray-300`}
              style={{
                height: inventoryAreaHeight,
                width: inventoryAreaWidth,
              }}
            >
              <div className="relative w-full h-full">
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
                {inventory.map((card, index) => {
                  const cardInfo = cardDatabase[card.type];
                  if (!cardInfo) return null; // Skip rendering if card data not loaded yet

                  const position = cardPositions.get(card.id);
                  if (!position) return null;

                  return (
                    <div
                      key={`card-${card.id}-${index}`}
                      className="absolute"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        zIndex: 10,
                      }}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryBox;
