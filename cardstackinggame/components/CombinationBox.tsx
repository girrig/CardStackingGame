"use client";

import Card from "@/components/Card";

const CombinationBox = ({
  inventory,
  setInventory,
  cardDatabase,
  heldCard,
  setHeldCard,
  combinationSlots,
  setCombinationSlots,
  recipeDatabase,
  message,
  setMessage,
}: {
  inventory: any[];
  setInventory: any;
  cardDatabase: any;
  heldCard: any;
  setHeldCard: any;
  combinationSlots: any[];
  setCombinationSlots: any;
  recipeDatabase: any[];
  message: string;
  setMessage: any;
}) => {
  // Handle slot click
  const handleSlotClick = (slotIndex: number) => {
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

        r.cards.forEach((card: any) => {
          recipeCounts.set(card, (recipeCounts.get(card) || 0) + 1);
        });
        cardTypes.forEach((card: any) => {
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
    <div className="w-64">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Combine</h2>

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
                  {heldCard ? "Click to place card" : "Select a card first"}
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
  );
};

export default CombinationBox;
