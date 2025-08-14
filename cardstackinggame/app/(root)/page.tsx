"use client";

import Card from "@/components/Card";
import CombinationBox from "@/components/CombinationBox";
import TabbedComponent from "@/components/TabbedComponent";
import cardData from "@/data/cards.json";
import { CardType } from "@/types/card";
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

    if (dropType === "inventory" && card.location === "combination") {
      // Handle drop from combination area to inventory
      const existingPile = inventory.find((item) => item.type === card.type);

      if (existingPile) {
        setInventory((prev: CardType[]) =>
          prev.map((item) =>
            item.type === card.type
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        const newId = Math.max(...inventory.map((i) => i.id), 0) + 1;
        setInventory((prev: CardType[]) => [
          ...prev,
          {
            ...card,
            id: newId,
            quantity: 1,
            location: "inventory",
            x: undefined,
            y: undefined,
          },
        ]);
      }

      // Remove from combination area
      setCombinationAreaCards((prev: CardType[]) =>
        prev.filter((item) => item.id !== card.id)
      );
    } else if (dropType === "combination") {
      // Handle drop to combination area
      if (card.location === "inventory") {
        // Card from inventory to combination area
        const combinationAreaElement = combinationAreaRef.current;
        if (!combinationAreaElement) return;

        const rect = combinationAreaElement.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(rect.width - 96, Math.random() * (rect.width - 96))
        ); // 96px = card width
        const y = Math.max(
          0,
          Math.min(rect.height - 128, Math.random() * (rect.height - 128))
        ); // 128px = card height

        const newId =
          Math.max(...combinationAreaCards.map((c) => c.id), 0, card.id, 0) + 1;

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
        const combinationAreaElement = combinationAreaRef.current;
        if (!combinationAreaElement) return;

        const rect = combinationAreaElement.getBoundingClientRect();
        const clientOffset = event.delta;

        // Calculate new position based on current position + drag delta
        const currentCard = combinationAreaCards.find((c) => c.id === card.id);
        if (currentCard) {
          const newX = Math.max(
            0,
            Math.min(rect.width - 96, (currentCard.x || 0) + clientOffset.x)
          );
          const newY = Math.max(
            0,
            Math.min(rect.height - 128, (currentCard.y || 0) + clientOffset.y)
          );

          setCombinationAreaCards((prev: CardType[]) =>
            prev.map((item) =>
              item.id === card.id ? { ...item, x: newX, y: newY } : item
            )
          );
        }
      }
    }
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
