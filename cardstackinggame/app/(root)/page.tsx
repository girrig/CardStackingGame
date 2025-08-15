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
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
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
  const [isDraggingFromInventory, setIsDraggingFromInventory] =
    useState<boolean>(false);

  // Set up sensor for mouse
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const sensors = useSensors(mouseSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card || null;
    setActiveCard(card);
    setIsDraggingFromInventory(card?.location === "inventory");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const card = active.data.current.card as CardType;

    // Clear visual drag state
    setActiveCard(null);
    setIsDraggingFromInventory(false);

    if (!over || !card) {
      return;
    }

    const dropType = over.data.current?.type;

    // Calculate drop position for combination area drops
    let dropPosition = null;
    if (
      dropType === "combination" &&
      card.location === "inventory" &&
      over.rect &&
      active.rect.current.translated
    ) {
      const overRect = over.rect;
      const activeRect = active.rect.current.translated;

      dropPosition = {
        x: Math.max(0, activeRect.left - overRect.left),
        y: Math.max(0, activeRect.top - overRect.top),
      };
    }

    // Handle the actual logic using existing dragUtils
    handleCardDrop(card, dropType, event.delta, dropPosition, {
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
      collisionDetection={pointerWithin}
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
                activeCard={activeCard}
                isDraggingFromInventory={isDraggingFromInventory}
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

      <DragOverlay modifiers={[snapCenterToCursor]}>
        {activeCard ? (
          <Card
            card={{ ...activeCard, quantity: 1 }}
            cardDatabase={cardDatabase}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default CardStackingGame;
