"use client";

import CombinationBox from "@/components/CombinationBox";
import TabbedComponent from "@/components/TabbedComponent";
import cardData from "@/data/cards.json";
import { CardType } from "@/types/card";
import { getIcon } from "@/utils/iconMap";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";

const CardStackingGame = () => {
  // Load card data from JSON and map icon strings to actual icon components
  const [cardDatabase, setCardDatabase] = useState({});

  // Initial inventory
  const [inventory, setInventory] = useState<CardType[]>([
    { id: 1, type: "test", quantity: 5, location: "inventory" },
    { id: 2, type: "tester", quantity: 1, location: "inventory" },
  ]);

  // Combination Area
  const [combinationAreaCards, setCombinationAreaCards] = useState<CardType[]>(
    []
  );

  // Container Refs
  const inventoryAreaRef = useRef<HTMLDivElement>(null);
  const combinationAreaRef = useRef<HTMLDivElement>(null);

  // Global drag monitor - handles all drag operations and invalid drops
  useEffect(() => {
    return monitorForElements({
      onDragStart: ({ source }) => {
        // DON'T remove items on drag start - wait for successful drop
        // This prevents the need for complex restoration logic
      },

      onDrop: ({ source, location }) => {
        const card = source.data.card as CardType;

        // Only handle invalid drops - successful drops are handled by drop targets
        if (!location.current.dropTargets.length) {
          // No restoration needed since we never removed the item
          // Could add card-specific invalid drop logic here if needed
        }
      },
    });
  }, []);

  useEffect(() => {
    const loadedCards: any = {};
    cardData.forEach((card: any) => {
      loadedCards[card.id] = {
        ...card,
        icon: getIcon(card.icon),
      };
    });
    setCardDatabase(loadedCards);
  }, []);

  return (
    <div className="h-screen bg-gray-50 p-4">
      <div className="w-full h-full flex flex-col">
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-3/4">
            <TabbedComponent
              inventoryAreaRef={inventoryAreaRef}
              inventory={inventory}
              setInventory={setInventory}
              cardDatabase={cardDatabase}
              setCombinationAreaCards={setCombinationAreaCards}
            />
          </div>

          <div className="w-1/4 flex flex-col">
            <CombinationBox
              combinationAreaRef={combinationAreaRef}
              setInventory={setInventory}
              cardDatabase={cardDatabase}
              combinationAreaCards={combinationAreaCards}
              setCombinationAreaCards={setCombinationAreaCards}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardStackingGame;
