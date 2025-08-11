"use client";

import Card from "@/components/Card";
import CombinationBox from "@/components/CombinationBox";
import InventoryBox from "@/components/InventoryBox";
import cardData from "@/data/cards.json";
import recipeData from "@/data/recipes.json";
import { Card as CardType } from "@/types/card";
import {
  handleDropToCombination,
  restoreCombinationCardAtPosition,
} from "@/utils/combinationUtils";
import {
  DragState,
  DropZone,
  detectDropZone,
  handleInvalidDropRestore,
} from "@/utils/dragUtils";
import { getIcon } from "@/utils/iconMap";
import {
  handleDropToInventoryFromCombination,
  handleInventoryReorder,
} from "@/utils/inventoryUtils";
import { useEffect, useRef, useState } from "react";

const CardStackingGame = () => {
  // Load card data from JSON and map icon strings to actual icon components
  const [cardDatabase, setCardDatabase] = useState({});
  const [recipeDatabase, setRecipeDatabase] = useState<any[]>([]);

  // Initial inventory
  const [inventory, setInventory] = useState<CardType[]>([
    { id: 1, type: "test", quantity: 5, location: "inventory" },
    { id: 2, type: "tester", quantity: 1, location: "inventory" },
  ]);

  // Combination Area
  const [combinationAreaCards, setCombinationAreaCards] = useState<CardType[]>(
    []
  );

  // Dragging
  const [globalDragState, setGlobalDragState] = useState<DragState | null>(
    null
  );

  // Container Refs
  const inventoryAreaRef = useRef<HTMLDivElement>(null);
  const combinationAreaRef = useRef<HTMLDivElement>(null);

  // Define drop zones
  const dropZones: DropZone[] = [
    { ref: inventoryAreaRef, type: "inventory" },
    { ref: combinationAreaRef, type: "combination" },
  ];

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

      const dropZone = detectDropZone(e.clientX, e.clientY, dropZones);
      const isFromCombination = globalDragState.card.location === "combination";

      if (dropZone) {
        if (dropZone.type === "inventory") {
          if (isFromCombination) {
            // Card from combination area dropped on inventory
            handleDropToInventoryFromCombination(
              globalDragState.card,
              inventory,
              setInventory
            );
          } else {
            // Handle inventory reordering
            handleInventoryReorder(
              globalDragState,
              e.clientX,
              e.clientY,
              inventory,
              setInventory,
              inventoryAreaRef
            );
          }
        } else if (dropZone.type === "combination") {
          if (!isFromCombination) {
            // Card from inventory dropped on combination area
            const rect = combinationAreaRef.current!.getBoundingClientRect();
            handleDropToCombination(
              globalDragState.card,
              e.clientX,
              e.clientY,
              rect,
              globalDragState.offsetX,
              globalDragState.offsetY,
              combinationAreaCards,
              setCombinationAreaCards,
              inventory
            );
          } else {
            // Card from combination area dropped back on combination area
            const rect = combinationAreaRef.current!.getBoundingClientRect();
            restoreCombinationCardAtPosition(
              globalDragState.card,
              e.clientX,
              e.clientY,
              rect,
              globalDragState.offsetX,
              globalDragState.offsetY,
              setCombinationAreaCards
            );
          }
        }
      } else {
        // Invalid drop - Restore card to original location
        handleInvalidDropRestore(
          globalDragState,
          inventory,
          setInventory,
          combinationAreaCards,
          setCombinationAreaCards
        );
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
          />

          <CombinationBox
            combinationAreaRef={combinationAreaRef}
            globalDragState={globalDragState}
            setGlobalDragState={setGlobalDragState}
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
