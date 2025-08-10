"use client";

import Card from "@/components/Card";
import { useEffect, useRef, useState } from "react";

const InventoryBox = ({
  inventory,
  setInventory,
  cardDatabase,
  heldCard,
  setHeldCard,
}: {
  inventory: any[];
  setInventory: any;
  cardDatabase: any;
  heldCard: any;
  setHeldCard: any;
}) => {
  // Drag and drop state
  const [cardPositions, setCardPositions] = useState<
    Map<number, { x: number; y: number }>
  >(new Map());

  // Tracks active dragging
  const [dragState, setDragState] = useState<{
    cardId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Hook for inventory area
  const inventoryRef = useRef<HTMLDivElement>(null);

  // Inventory slot configuration
  const SLOT_WIDTH = 100; // w-24 (96px) + border-2 (4px) = 100px
  const SLOT_HEIGHT = 132; // h-32 (128px) + border-2 (4px) = 132px
  const SLOT_GAP = 8;

  // Simple fixed grid layout
  const CARDS_PER_ROW = 8;
  const FIXED_ROWS = 3;

  // Track card positions
  const getCardGridPosition = (cardIndex: number) => {
    const row = Math.floor(cardIndex / CARDS_PER_ROW);
    const col = cardIndex % CARDS_PER_ROW;

    return {
      x: SLOT_GAP + col * (SLOT_WIDTH + SLOT_GAP),
      y: SLOT_GAP + row * (SLOT_HEIGHT + SLOT_GAP),
    };
  };

  // Calculate container dimensions
  const containerWidth =
    2 * SLOT_GAP + CARDS_PER_ROW * SLOT_WIDTH + (CARDS_PER_ROW - 1) * SLOT_GAP;
  const containerHeight =
    2 * SLOT_GAP + FIXED_ROWS * SLOT_HEIGHT + (FIXED_ROWS - 1) * SLOT_GAP;

  // Initialize card positions in a grid layout
  useEffect(() => {
    setCardPositions((prev) => {
      const newMap = new Map(prev);
      inventory.forEach((card, index) => {
        newMap.set(card.id, getCardGridPosition(index));
      });
      return newMap;
    });
  }, [inventory]);

  // Document-level drag event listeners
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (!dragState) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      // Calculate new position without boundaries
      const newX = dragState.offsetX + deltaX;
      const newY = dragState.offsetY + deltaY;

      setCardPositions(
        (prev) =>
          new Map(
            prev.set(dragState.cardId, {
              x: newX,
              y: newY,
            })
          )
      );
    };

    const handleDocumentMouseUp = () => {
      if (dragState) {
        const currentPosition = cardPositions.get(dragState.cardId);
        if (currentPosition) {
          // Find the nearest grid position
          const col = Math.max(
            0,
            Math.min(
              CARDS_PER_ROW - 1,
              Math.round(
                (currentPosition.x - SLOT_GAP) / (SLOT_WIDTH + SLOT_GAP)
              )
            )
          );
          const row = Math.max(
            0,
            Math.round(
              (currentPosition.y - SLOT_GAP) / (SLOT_HEIGHT + SLOT_GAP)
            )
          );
          const targetIndex = row * CARDS_PER_ROW + col;

          // Find the card being dragged in inventory
          const cardIndex = inventory.findIndex(
            (card) => card.id === dragState.cardId
          );

          if (
            cardIndex !== -1 &&
            targetIndex !== cardIndex &&
            targetIndex < inventory.length
          ) {
            // Reorder the inventory array
            setInventory((prev) => {
              const newInventory = [...prev];
              const [movedCard] = newInventory.splice(cardIndex, 1);
              newInventory.splice(targetIndex, 0, movedCard);
              return newInventory;
            });
          } else {
            // Snap back to original position
            const originalIndex = inventory.findIndex(
              (card) => card.id === dragState.cardId
            );
            if (originalIndex !== -1) {
              setCardPositions(
                (prev) =>
                  new Map(
                    prev.set(
                      dragState.cardId,
                      getCardGridPosition(originalIndex)
                    )
                  )
              );
            }
          }
        }
      }
      setDragState(null);
    };

    if (dragState) {
      document.addEventListener("mousemove", handleDocumentMouseMove);
      document.addEventListener("mouseup", handleDocumentMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleDocumentMouseMove);
        document.removeEventListener("mouseup", handleDocumentMouseUp);
      };
    }
  }, [dragState, cardPositions, inventory, setInventory]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, card: any) => {
    e.preventDefault();

    const currentPosition = cardPositions.get(card.id)!;

    setDragState({
      cardId: card.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: currentPosition.x,
      offsetY: currentPosition.y,
    });
  };

  // Handle card selection (for combination slots)
  const handleCardClick = (card: any) => {
    if (card.quantity > 0) {
      // Just select the card, don't deduct yet
      setHeldCard(card);
    }
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
              ref={inventoryRef}
              className="relative"
              style={{
                height: containerHeight,
                width: containerWidth,
              }}
            >
              {/* Render cards */}
              {inventory.map((card, index) => {
                const isSelected = heldCard && heldCard.id === card.id;
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
                      zIndex: dragState?.cardId === card.id ? 1000 : 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, card)}
                  >
                    <Card
                      card={card}
                      cardDatabase={cardDatabase}
                      onClick={handleCardClick}
                      isSelected={isSelected}
                    />
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
