"use client";

import Card from "@/components/Card";
import CombinationBox from "@/components/CombinationBox";
import InventoryBox from "@/components/InventoryBox";
import cardData from "@/data/cards.json";
import recipeData from "@/data/recipes.json";
import { getIcon } from "@/utils/iconMap";
import { useEffect, useRef, useState } from "react";

const CardStackingGame = () => {
  // Load card data from JSON and map icon strings to actual icon components
  const [cardDatabase, setCardDatabase] = useState({});
  const [recipeDatabase, setRecipeDatabase] = useState<any[]>([]);

  // Initial inventory
  const [inventory, setInventory] = useState([
    { id: 1, type: "test", quantity: 5 },
    { id: 2, type: "tester", quantity: 1 },
  ]);

  // Combination Area
  const [combinationAreaCards, setCombinationAreaCards] = useState([]);

  // Dragging
  const [heldCard, setHeldCard] = useState(null);
  const [globalDragState, setGlobalDragState] = useState<{
    cardId: number;
    card: any;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Container Refs
  const inventoryAreaRef = useRef<HTMLDivElement>(null);
  const combinationAreaRef = useRef<HTMLDivElement>(null);

  // Handle card drop to inventory (for reordering)
  const handleCardDropToInventory = (
    cardId: number,
    dropX: number,
    dropY: number
  ) => {
    if (!inventoryAreaRef.current) return;

    const rect = inventoryAreaRef.current.getBoundingClientRect();
    const relativeX = dropX - rect.left;
    const relativeY = dropY - rect.top;

    // Inventory slot configuration (matching InventoryBox)
    const SLOT_WIDTH = 100;
    const SLOT_HEIGHT = 132;
    const SLOT_GAP = 8;
    const CARDS_PER_ROW = 8;

    // Convert to grid position
    const col = Math.max(
      0,
      Math.min(
        CARDS_PER_ROW - 1,
        Math.round((relativeX - SLOT_GAP) / (SLOT_WIDTH + SLOT_GAP))
      )
    );
    const row = Math.max(
      0,
      Math.round((relativeY - SLOT_GAP) / (SLOT_HEIGHT + SLOT_GAP))
    );
    const targetIndex = row * CARDS_PER_ROW + col;

    // Find the card being dragged
    const cardIndex = inventory.findIndex((card) => card.id === cardId);

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
    }
  };

  // Handle card drop to combination area
  const handleCardDropToCombination = (
    card: any,
    dropX?: number,
    dropY?: number
  ) => {
    // Add card to combination area
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
      // Store the drop position if provided
      ...(dropX !== undefined && dropY !== undefined && { dropX, dropY }),
    };
    setCombinationAreaCards((prev) => [...prev, newCard]);
  };

  // Global mouse event handlers for cross-component dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (globalDragState) {
        setGlobalDragState((prev) =>
          prev
            ? {
                ...prev,
                currentX: e.clientX,
                currentY: e.clientY,
              }
            : null
        );
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!globalDragState) return;

      // Check if dropped on inventory area
      if (inventoryAreaRef.current) {
        const invRect = inventoryAreaRef.current.getBoundingClientRect();
        const isOverInventoryArea =
          e.clientX >= invRect.left &&
          e.clientX <= invRect.right &&
          e.clientY >= invRect.top &&
          e.clientY <= invRect.bottom;

        if (isOverInventoryArea) {
          // Check if this card was removed from inventory during drag start
          const wasRemovedFromInventory = !inventory.some(
            (item) => item.id === globalDragState.card.id
          );

          if (wasRemovedFromInventory) {
            // Only restore if the card is not currently in combination area
            const isNotInCombination = !combinationAreaCards.some(
              (item) => item.id === globalDragState.card.id
            );

            if (isNotInCombination) {
              // Find if there's an existing stack of the same type to add to
              const existingStack = inventory.find(
                (item) => item.type === globalDragState.card.type
              );

              if (existingStack) {
                // Restore to existing stack
                setInventory((prev) =>
                  prev.map((item) =>
                    item.type === globalDragState.card.type
                      ? { ...item, quantity: item.quantity + 1 }
                      : item
                  )
                );
              } else {
                // Add back as a new single card
                setInventory((prev) => [...prev, globalDragState.card]);
              }
            }
          } else {
            // Handle normal inventory reordering for existing cards
            handleCardDropToInventory(
              globalDragState.cardId,
              e.clientX,
              e.clientY
            );
          }
          setGlobalDragState(null);
          return;
        }
      }

      // Check if dropped on combination area
      if (combinationAreaRef.current) {
        const combRect = combinationAreaRef.current.getBoundingClientRect();
        const isOverCombinationArea =
          e.clientX >= combRect.left &&
          e.clientX <= combRect.right &&
          e.clientY >= combRect.top &&
          e.clientY <= combRect.bottom;

        if (isOverCombinationArea) {
          // Check if this is a card from combination area
          const isFromCombination = combinationAreaCards.some(
            (item) => item.id === globalDragState.cardId
          );

          if (!isFromCombination) {
            // This is a card from inventory, move it to combination area
            // Calculate exact drop position relative to combination area using the offset
            const CONTAINER_BORDER = 2; // border-2 class = 2px border
            const relativeX =
              e.clientX -
              combRect.left -
              globalDragState.offsetX -
              CONTAINER_BORDER;
            const relativeY =
              e.clientY -
              combRect.top -
              globalDragState.offsetY -
              CONTAINER_BORDER;
            handleCardDropToCombination(
              globalDragState.card,
              relativeX,
              relativeY
            );
          } else {
            // This will be handled by CombinationBox's positioning system
            // Just clear the drag state - CombinationBox will handle repositioning
          }
          setGlobalDragState(null);
          return;
        }
      }

      // If not dropped on any valid area, restore the card to inventory
      const wasRemovedFromInventory = !inventory.some(
        (item) => item.id === globalDragState.card.id
      );
      const isNotInCombination = !combinationAreaCards.some(
        (item) => item.id === globalDragState.card.id
      );

      if (wasRemovedFromInventory && isNotInCombination) {
        // Only restore if the card is not currently in combination area
        // Find if there's an existing stack of the same type to add to
        const existingStack = inventory.find(
          (item) => item.type === globalDragState.card.type
        );

        if (existingStack) {
          // Restore to existing stack
          setInventory((prev) =>
            prev.map((item) =>
              item.type === globalDragState.card.type
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
        } else {
          // Add back as a new single card
          setInventory((prev) => [...prev, globalDragState.card]);
        }
      }

      setGlobalDragState(null);
    };

    if (globalDragState) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [globalDragState]);

  useEffect(() => {
    const loadedCards: any = {};
    cardData.forEach((card: any) => {
      loadedCards[card.id] = {
        ...card,
        icon: getIcon(card.icon),
      };
    });
    setCardDatabase(loadedCards);
    setRecipeDatabase(recipeData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Card Stacking Game
        </h1>

        <div className="flex gap-8">
          <InventoryBox
            inventoryAreaRef={inventoryAreaRef}
            setGlobalDragState={setGlobalDragState}
            globalDragState={globalDragState}
            inventory={inventory}
            setInventory={setInventory}
            cardDatabase={cardDatabase}
            heldCard={heldCard}
            setHeldCard={setHeldCard}
          />

          <CombinationBox
            combinationAreaRef={combinationAreaRef}
            globalDragState={globalDragState}
            setGlobalDragState={setGlobalDragState}
            inventory={inventory}
            setInventory={setInventory}
            cardDatabase={cardDatabase}
            combinationAreaCards={combinationAreaCards}
            setCombinationAreaCards={setCombinationAreaCards}
          />
        </div>

        {/* Floating drag preview card */}
        {globalDragState && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: globalDragState.currentX - globalDragState.offsetX,
              top: globalDragState.currentY - globalDragState.offsetY,
            }}
          >
            <Card card={globalDragState.card} cardDatabase={cardDatabase} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CardStackingGame;
