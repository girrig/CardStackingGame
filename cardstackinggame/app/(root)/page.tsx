"use client";

import Card from "@/components/Card";
import { Hammer } from "lucide-react";
import { useState } from "react";

const CardStackingGame = () => {
  // Define card types and their properties
  const cardDatabase = {
    test: { name: "Test Card", icon: Hammer, color: "#8B4513" },
    tester: { name: "Tester Card", icon: Hammer, color: "#696969" },
  };

  // Define combination recipes
  const recipes = {
    "test+test": "tester",
  };

  // Initial inventory
  const [inventory, setInventory] = useState([
    { id: 1, type: "test", quantity: 5 },
  ]);

  const [combinationSlots, setCombinationSlots] = useState([null, null]);
  const [heldCard, setHeldCard] = useState(null);
  const [message, setMessage] = useState("");

  // Handle card selection
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

  // Handle combining cards
  const handleCombine = () => {
    if (combinationSlots[0] && combinationSlots[1]) {
      const key = `${combinationSlots[0].type}+${combinationSlots[1].type}`;
      const result = recipes[key];

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
          Colony Builder
        </h1>

        <div className="flex gap-8">
          {/* Main Inventory Area */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Inventory
              </h2>
              <div className="flex flex-wrap gap-4">
                {inventory.map((card) => {
                  const isSelected = heldCard && heldCard.id === card.id;
                  return (
                    <Card
                      key={card.id}
                      card={card}
                      cardDatabase={cardDatabase}
                      onClick={handleCardClick}
                      isSelected={isSelected}
                    />
                  );
                })}
              </div>
              {inventory.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  Your inventory is empty
                </div>
              )}
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
