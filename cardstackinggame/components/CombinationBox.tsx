"use client";

import Card from "@/components/Card";
import { Card as CardType } from "@/types/card";
import { DragState, initializeDragFromCombination } from "@/utils/dragUtils";
import { useEffect, useState } from "react";

const CombinationBox = ({
  combinationAreaRef,
  globalDragState,
  setGlobalDragState,
  setInventory,
  cardDatabase,
  combinationAreaCards,
  setCombinationAreaCards,
}: {
  combinationAreaRef: React.RefObject<HTMLDivElement | null>;
  globalDragState: DragState | null;
  setGlobalDragState: (state: DragState | null) => void;
  setInventory: (
    inventory: CardType[] | ((prev: CardType[]) => CardType[])
  ) => void;
  cardDatabase: any;
  combinationAreaCards: CardType[];
  setCombinationAreaCards: (
    cards: CardType[] | ((prev: CardType[]) => CardType[])
  ) => void;
}) => {
  // Card positions
  const [cardPositions, setCardPositions] = useState<
    Map<number, { x: number; y: number }>
  >(new Map());

  // Initialize card positions in a scattered layout
  useEffect(() => {
    setCardPositions((prev) => {
      const newMap = new Map(prev);
      let hasChanges = false;

      combinationAreaCards.forEach((card) => {
        if (!newMap.has(card.id)) {
          let x, y;

          // Use drop position if provided, otherwise place at top left
          if (card.dropX !== undefined && card.dropY !== undefined) {
            x = card.dropX;
            y = card.dropY;
          } else {
            x = 20;
            y = 20;
          }

          newMap.set(card.id, { x, y });
          hasChanges = true;
        }
      });

      // Remove cards that no longer exist
      for (const cardId of newMap.keys()) {
        if (!combinationAreaCards.some((card) => card.id === cardId)) {
          newMap.delete(cardId);
          hasChanges = true;
        }
      }

      return hasChanges ? newMap : prev;
    });
  }, [combinationAreaCards]);

  // Handle mouse movement for repositioning cards
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (globalDragState && combinationAreaRef.current) {
        const cardInCombination = combinationAreaCards.find(
          (card) => card.id === globalDragState.cardId
        );
        if (cardInCombination) {
          const rect = combinationAreaRef.current.getBoundingClientRect();
          // Position card using the offset to maintain grab position
          const CONTAINER_BORDER = 2; // border-2 class = 2px border
          const relativeX =
            e.clientX - rect.left - globalDragState.offsetX - CONTAINER_BORDER;
          const relativeY =
            e.clientY - rect.top - globalDragState.offsetY - CONTAINER_BORDER;

          setCardPositions(
            (prev) =>
              new Map(
                prev.set(globalDragState.cardId, {
                  x: relativeX,
                  y: relativeY,
                })
              )
          );
        }
      }
    };

    if (globalDragState) {
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [globalDragState, combinationAreaCards]);

  // Handle mouse down for dragging cards within combination area
  const handleMouseDown = (e: React.MouseEvent, card: CardType) => {
    e.preventDefault();

    const dragState = initializeDragFromCombination(
      e,
      card,
      setCombinationAreaCards
    );

    setGlobalDragState(dragState);
  };

  // Clear Area - Return all cards to inventory
  const clearArea = () => {
    // Store current combination cards before clearing to avoid race conditions
    const cardsToReturn = [...combinationAreaCards];

    // Clear combination area immediately
    setCombinationAreaCards([]);
    setCardPositions(new Map());

    // Then update inventory based on the snapshot
    setInventory((prevInventory: CardType[]) => {
      const newInventory = [...prevInventory];

      cardsToReturn.forEach((card) => {
        const existingCardIndex = newInventory.findIndex(
          (item) => item.type === card.type
        );

        if (existingCardIndex !== -1) {
          // Update existing card quantity
          newInventory[existingCardIndex] = {
            ...newInventory[existingCardIndex],
            quantity: newInventory[existingCardIndex].quantity + 1,
          };
        } else {
          // Add new card to inventory
          const newId =
            newInventory.length > 0
              ? Math.max(...newInventory.map((i) => i.id)) + 1
              : 1;
          newInventory.push({
            id: newId,
            type: card.type,
            quantity: 1,
          });
        }
      });

      return newInventory;
    });
  };

  return (
    <div className="flex-1">
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
        <h2 className="text-xl font-medium text-gray-900 mb-6">
          Combination Area
        </h2>

        {/* Combination Area */}
        <div
          ref={combinationAreaRef}
          className="w-full min-h-96 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg transition-all hover:bg-gray-100 relative overflow-hidden"
        >
          {combinationAreaCards.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg p-4">
              Drag cards from your inventory and combined them here
            </div>
          ) : (
            combinationAreaCards.map((card, index) => {
              const isBeingDragged =
                globalDragState && globalDragState.cardId === card.id;
              const cardInfo = cardDatabase[card.type];
              if (!cardInfo) return null;

              const position = cardPositions.get(card.id);
              if (!position) return null; // Skip if no position yet

              return (
                <div
                  key={`combination-card-${card.id}-${index}`}
                  className="absolute"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    zIndex: 10,
                    opacity: isBeingDragged ? 0 : 1,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, card)}
                >
                  <Card card={card} cardDatabase={cardDatabase} />
                </div>
              );
            })
          )}
        </div>

        {/* Clear Button */}
        <div className="mt-6">
          <button
            onClick={clearArea}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded py-2 px-4 font-medium transition-colors"
          >
            Clear Area
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombinationBox;
