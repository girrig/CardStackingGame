"use client";

import Card from "@/components/Card";
import cardData from "@/data/cards.json";
import recipeData from "@/data/recipes.json";
import { getIcon } from "@/utils/iconMap";
import { useEffect, useRef, useState } from "react";

const CardStackingGame = () => {
  // Load card data from JSON and map icon strings to actual icon components
  const [cardDatabase, setCardDatabase] = useState({});
  const [recipeDatabase, setRecipeDatabase] = useState({});

  // Initial inventory
  const [inventory, setInventory] = useState([
    { id: 1, type: "test", quantity: 5 },
    { id: 2, type: "tester", quantity: 1 },
  ]);

  const [combinationSlots, setCombinationSlots] = useState([null, null]);
  const [heldCard, setHeldCard] = useState(null);
  const [message, setMessage] = useState("");

  // Drag and drop state
  const [cardPositions, setCardPositions] = useState<
    Map<number, { x: number; y: number }>
  >(new Map());

  // Tracks active dragging
  const [dragState, setDragState] = useState<{
    cardId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Hook for inventory area
  const inventoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadedCards = {};
    cardData.forEach((card) => {
      loadedCards[card.id] = {
        ...card,
        icon: getIcon(card.icon),
      };
    });
    setCardDatabase(loadedCards);
    setRecipeDatabase(recipeData);
  }, []);

  // Initialize card positions for all inventory items
  useEffect(() => {
    setCardPositions((prev) => {
      const newMap = new Map(prev);
      inventory.forEach((card, index) => {
        if (!newMap.has(card.id)) {
          // Arrange cards in a grid pattern
          const cardsPerRow = 8;
          const cardWidth = 96 + 16; // card width + gap
          const cardHeight = 128 + 16; // card height + gap
          const x = (index % cardsPerRow) * cardWidth;
          const y = Math.floor(index / cardsPerRow) * cardHeight;
          newMap.set(card.id, { x, y });
        }
      });
      return newMap;
    });
  }, [inventory]);

  // Document-level drag event listeners
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (!dragState) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      // Calculate new position without boundaries
      const newX = dragState.offsetX + deltaX;
      const newY = dragState.offsetY + deltaY;

      setCardPositions(
        (prev) =>
          new Map(
            prev.set(dragState.cardId, {
              x: newX,
              y: newY,
            })
          )
      );
    };

    const handleDocumentMouseUp = () => {
      setDragState(null);
    };

    if (dragState) {
      document.addEventListener("mousemove", handleDocumentMouseMove);
      document.addEventListener("mouseup", handleDocumentMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleDocumentMouseMove);
        document.removeEventListener("mouseup", handleDocumentMouseUp);
      };
    }
  }, [dragState, cardPositions]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, card: any) => {
    e.preventDefault();

    const currentPosition = cardPositions.get(card.id)!;

    setDragState({
      cardId: card.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: currentPosition.x,
      offsetY: currentPosition.y,
    });
  };

  // Handle card selection (for combination slots)
  const handleCardClick = (card) => {
    if (card.quantity > 0) {
      // Just select the card, don't deduct yet
      setHeldCard(card);
    }
  };

  // Handle slot click
  const handleSlotClick = (slotIndex) => {
    if (heldCard) {
      // Move from inventory to slot
      const newSlots = [...combinationSlots];
      newSlots[slotIndex] = { ...heldCard, quantity: 1 };
      setCombinationSlots(newSlots);

      // Deduct from inventory
      setInventory((prev) =>
        prev
          .map((item) =>
            item.id === heldCard.id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0)
      );

      setHeldCard(null); // Empty your hand
    }
  };

  // Handles combining two cards from the combination slots
  const handleCombine = () => {
    // Ensure both combination slots are filled
    if (combinationSlots[0] && combinationSlots[1]) {
      // Get the types of cards currently in combination slots
      const cardTypes = [combinationSlots[0].type, combinationSlots[1].type];

      // Find a matching recipe if it exists
      const recipe = recipeDatabase.find((r) => {
        // If different lengths, exit early
        if (r.cards.length !== cardTypes.length) return false;

        // Count the frequency of each card type
        const recipeCounts = new Map<string, number>();
        const comboCounts = new Map<string, number>();

        r.cards.forEach((card) => {
          recipeCounts.set(card, (recipeCounts.get(card) || 0) + 1);
        });
        cardTypes.forEach((card) => {
          comboCounts.set(card, (comboCounts.get(card) || 0) + 1);
        });

        // If different number of unique card types, exit early
        if (recipeCounts.size !== comboCounts.size) return false;

        // Ensure exact same quantities for each card type
        for (const [card, count] of recipeCounts) {
          if (comboCounts.get(card) !== count) return false;
        }

        return true;
      });

      // Extract the result from the matching recipe (if found)
      const result = recipe?.result;

      if (result) {
        // Add new card to inventory
        const existingCard = inventory.find((item) => item.type === result);
        if (existingCard) {
          setInventory((prev) =>
            prev.map((item) =>
              item.type === result
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
        } else {
          const newId = Math.max(...inventory.map((i) => i.id), 0) + 1;
          setInventory((prev) => [
            ...prev,
            { id: newId, type: result, quantity: 1 },
          ]);
        }

        setMessage(`Created ${cardDatabase[result].name}!`);
        setCombinationSlots([null, null]);
        setHeldCard(null);

        // Clear message after 2 seconds
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("These cards cannot be combined!");
        setHeldCard(null);
        setTimeout(() => setMessage(""), 2000);
      }
    }
  };

  // Clear combination slots
  const clearSlots = () => {
    // Return cards to inventory
    combinationSlots.forEach((slot) => {
      if (slot) {
        const existingCard = inventory.find((item) => item.type === slot.type);
        if (existingCard) {
          setInventory((prev) =>
            prev.map((item) =>
              item.type === slot.type
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
        } else {
          const newId = Math.max(...inventory.map((i) => i.id), 0) + 1;
          setInventory((prev) => [
            ...prev,
            { id: newId, type: slot.type, quantity: 1 },
          ]);
        }
      }
    });
    setCombinationSlots([null, null]);
    setHeldCard(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Card Stacking Game
        </h1>

        <div className="flex gap-8">
          {/* Main Inventory Area */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Inventory
              </h2>
              <div
                ref={inventoryRef}
                className="relative h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg"
              >
                {inventory.map((card) => {
                  const isSelected = heldCard && heldCard.id === card.id;
                  const cardInfo = cardDatabase[card.type];
                  if (!cardInfo) return null; // Skip rendering if card data not loaded yet

                  const position = cardPositions.get(card.id) || { x: 0, y: 0 };

                  return (
                    <div
                      key={card.id}
                      className="absolute"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        zIndex: dragState?.cardId === card.id ? 1000 : 1,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, card)}
                    >
                      <Card
                        card={card}
                        cardDatabase={cardDatabase}
                        onClick={handleCardClick}
                        isSelected={isSelected}
                      />
                    </div>
                  );
                })}
                {inventory.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Your inventory is empty
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Combination Area */}
          <div className="w-64">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Combine
              </h2>

              {/* Combination Slots */}
              <div className="space-y-4 mb-6">
                {combinationSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="w-full h-32 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-gray-100"
                    onClick={() => !slot && handleSlotClick(index)}
                  >
                    {slot ? (
                      <Card card={slot} cardDatabase={cardDatabase} />
                    ) : (
                      <div className="text-gray-400 text-sm">
                        {heldCard
                          ? "Click to place card"
                          : "Select a card first"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCombine}
                  disabled={!combinationSlots[0] || !combinationSlots[1]}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded py-3 px-4 font-medium transition-colors"
                >
                  Combine
                </button>

                <button
                  onClick={clearSlots}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded py-2 px-4 font-medium transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Message Area */}
              {message && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm text-center">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardStackingGame;
