"use client";

import CombinationBox from "@/components/CombinationBox";
import TabbedComponent from "@/components/TabbedComponent";
import cardData from "@/data/cards.json";
import { CardType } from "@/types/card";
import { getIcon } from "@/utils/iconMap";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
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
  const globalAreaRef = useRef<HTMLDivElement>(null);

  // Global drag monitor - handles all drag operations and invalid drops
  useEffect(() => {
    return monitorForElements({
      onDragStart: ({ source }) => {
        // DON'T remove items on drag start - wait for successful drop
        // This prevents the need for complex restoration logic
      },

      onDrop: ({ source, location }) => {
        const card = source.data.card as CardType;

        // Check if this was an invalid drop (only global drop target hit)
        const isInvalidDrop =
          location.current.dropTargets.length === 1 &&
          location.current.dropTargets[0]?.data.type === "global";

        if (isInvalidDrop) {
          // No restoration needed since we never removed the item
          // Could add card-specific invalid drop logic here if needed
        }
      },
    });
  }, []);

  // Global drop target to prevent "do not" cursor
  useEffect(() => {
    const element = globalAreaRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ type: "global" }),
      onDrop: ({ location }) => {
        // Only handle drops that didn't hit any specific drop targets
        if (location.current.dropTargets.length === 1) {
          // Only the global drop target was hit - this is an invalid drop
          // Do nothing, just prevent the "do not" cursor
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
    <div ref={globalAreaRef} className="h-screen bg-gray-50 p-4">
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
