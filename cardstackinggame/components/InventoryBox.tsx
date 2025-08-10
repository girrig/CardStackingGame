"use client";

import Card from "@/components/Card";
import { useEffect, useState } from "react";

const InventoryBox = ({
  inventoryAreaRef,
  setGlobalDragState,
  globalDragState,
  inventory,
  setInventory,
  cardDatabase,
  heldCard,
  setHeldCard,
}: {
  inventoryAreaRef: React.RefObject<HTMLDivElement>;
  globalDragState: any;
  setGlobalDragState: any;
  inventory: any[];
  setInventory: any;
  cardDatabase: any;
  heldCard: any;
  setHeldCard: any;
}) => {
  // Card positions for grid layout
  const [cardPositions, setCardPositions] = useState<
    Map<number, { x: number; y: number }>
  >(new Map());

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

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, card: any) => {
    e.preventDefault();

    // Calculate offset from mouse position to top-left of card
    const cardElement = e.currentTarget as HTMLElement;
    const cardRect = cardElement.getBoundingClientRect();
    const offsetX = e.clientX - cardRect.left;
    const offsetY = e.clientY - cardRect.top;

    let cardToDrag = card;

    // If card has more than one copy, create a single card to drag and decrement the stack
    if (card.quantity > 1) {
      // Create a new card with quantity 1 for dragging
      const newId = Math.max(...inventory.map((c) => c.id), 0) + 1;
      cardToDrag = {
        ...card,
        id: newId,
        quantity: 1,
      };

      // Immediately decrement the original stack
      setInventory((prev) =>
        prev.map((item) =>
          item.id === card.id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else {
      // For single cards, remove from inventory immediately
      setInventory((prev) => prev.filter((item) => item.id !== card.id));
    }

    // Set global drag state with offset information
    setGlobalDragState({
      cardId: cardToDrag.id,
      card: cardToDrag,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      offsetX: offsetX,
      offsetY: offsetY,
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
                    <Card
                      card={card}
                      cardDatabase={cardDatabase}
                      onClick={handleCardClick}
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
