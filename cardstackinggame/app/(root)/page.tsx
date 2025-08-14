"use client";

import Card from "@/components/Card";
import CombinationBox from "@/components/CombinationBox";
import TabbedComponent from "@/components/TabbedComponent";
import cardData from "@/data/cards.json";
import { CardType } from "@/types/card";
import { handleCardDrop } from "@/utils/dragUtils";
import { getIcon } from "@/utils/iconMap";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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

  // Drag state for overlay
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  // Set up sensor for mouse
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const sensors = useSensors(mouseSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCard(event.active.data.current?.card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || !active.data.current?.card) return;

    const card = active.data.current.card as CardType;
    const dropType = over.data.current?.type;

    handleCardDrop(card, dropType, event.delta, {
      inventory,
      combinationAreaCards,
      setInventory,
      setCombinationAreaCards,
      combinationAreaRef,
    });
  };

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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen bg-gray-50 p-4">
        <div className="w-full h-full flex flex-col">
          <div className="flex gap-4 flex-1 min-h-0">
            <div className="w-3/4">
              <TabbedComponent
                inventoryAreaRef={inventoryAreaRef}
                inventory={inventory}
                cardDatabase={cardDatabase}
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

      <DragOverlay>
        {activeCard ? (
          <Card card={activeCard} cardDatabase={cardDatabase} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default CardStackingGame;
