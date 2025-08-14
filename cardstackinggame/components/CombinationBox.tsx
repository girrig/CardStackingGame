"use client";

import Card from "@/components/Card";
import { CardType } from "@/types/card";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect } from "react";

const CombinationBox = ({
  combinationAreaRef,
  setInventory,
  cardDatabase,
  combinationAreaCards,
  setCombinationAreaCards,
}: {
  combinationAreaRef: React.RefObject<HTMLDivElement | null>;
  setInventory: (
    inventory: CardType[] | ((prev: CardType[]) => CardType[])
  ) => void;
  cardDatabase: any;
  combinationAreaCards: CardType[];
  setCombinationAreaCards: (
    cards: CardType[] | ((prev: CardType[]) => CardType[])
  ) => void;
}) => {
  // Set up drop zone for combination area
  useEffect(() => {
    const element = combinationAreaRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ type: "combination" }),
      onDrop: ({ source, location }) => {
        const card = source.data.card as CardType;
        const dragOffset = source.data.dragOffset as { x: number; y: number };
        if (!card) return;

        // Calculate drop position relative to combination area
        const rect = element.getBoundingClientRect();
        const containerBorder = 2;

        // Subtract the drag offset so the card appears where the user grabbed it
        const x =
          location.current.input.clientX -
          rect.left -
          containerBorder -
          (dragOffset?.x || 0);
        const y =
          location.current.input.clientY -
          rect.top -
          containerBorder -
          (dragOffset?.y || 0);

        if (card.location === "inventory") {
          // Card from inventory to combination area
          const newId =
            Math.max(...combinationAreaCards.map((c) => c.id), 0, card.id, 0) +
            1;

          const newCard: CardType = {
            ...card,
            id: newId,
            quantity: 1,
            location: "combination",
            x,
            y,
          };

          setCombinationAreaCards((prev: CardType[]) => [...prev, newCard]);

          // Remove from inventory
          if (card.quantity > 1) {
            setInventory((prev: CardType[]) =>
              prev.map((item) =>
                item.id === card.id
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              )
            );
          } else {
            setInventory((prev: CardType[]) =>
              prev.filter((item) => item.id !== card.id)
            );
          }
        } else if (card.location === "combination") {
          // Card repositioned within combination area
          setCombinationAreaCards((prev: CardType[]) =>
            prev.map((c) => (c.id === card.id ? { ...c, x, y } : c))
          );
        }
      },
    });
  }, [combinationAreaCards, setCombinationAreaCards, combinationAreaRef]);

  // Clear Area - Return all cards to inventory
  const clearArea = () => {
    // Store current combination cards before clearing to avoid race conditions
    const cardsToReturn = [...combinationAreaCards];

    // Clear combination area immediately
    setCombinationAreaCards([]);

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
            location: "inventory",
          });
        }
      });

      return newInventory;
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
        {/* Combination Area */}
        <div
          ref={combinationAreaRef}
          className="w-full flex-1 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg relative overflow-hidden"
        >
          {combinationAreaCards.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg p-4">
              Drag cards from your inventory and combined them here
            </div>
          ) : (
            combinationAreaCards.map((card, index) => {
              const cardInfo = cardDatabase[card.type];
              if (!cardInfo) return null;

              // Use coordinates directly from the card, with fallback
              const x = card.x ?? 20;
              const y = card.y ?? 20;

              return (
                <div
                  key={`combination-card-${card.id}-${index}`}
                  className="absolute"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    zIndex: 10,
                  }}
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
