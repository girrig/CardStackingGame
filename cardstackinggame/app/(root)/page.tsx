"use client";

import CombinationBox from "@/components/CombinationBox";
import InventoryBox from "@/components/InventoryBox";
import cardData from "@/data/cards.json";
import recipeData from "@/data/recipes.json";
import { getIcon } from "@/utils/iconMap";
import { useEffect, useState } from "react";

const CardStackingGame = () => {
  // Load card data from JSON and map icon strings to actual icon components
  const [cardDatabase, setCardDatabase] = useState({});
  const [recipeDatabase, setRecipeDatabase] = useState<any[]>([]);

  // Initial inventory
  const [inventory, setInventory] = useState([
    { id: 1, type: "test", quantity: 5 },
    { id: 2, type: "tester", quantity: 1 },
  ]);

  const [combinationSlots, setCombinationSlots] = useState([null, null]);
  const [heldCard, setHeldCard] = useState(null);
  const [message, setMessage] = useState("");

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
            inventory={inventory}
            setInventory={setInventory}
            cardDatabase={cardDatabase}
            heldCard={heldCard}
            setHeldCard={setHeldCard}
          />

          <CombinationBox
            inventory={inventory}
            setInventory={setInventory}
            cardDatabase={cardDatabase}
            heldCard={heldCard}
            setHeldCard={setHeldCard}
            combinationSlots={combinationSlots}
            setCombinationSlots={setCombinationSlots}
            recipeDatabase={recipeDatabase}
            message={message}
            setMessage={setMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default CardStackingGame;
