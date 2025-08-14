"use client";

import { CardType } from "@/types/card";
import { useState } from "react";
import InventoryBox from "./InventoryBox";

type Tab = {
  id: string;
  label: string;
};

const TabbedComponent = ({
  inventoryAreaRef,
  inventory,
  setInventory,
  cardDatabase,
  setCombinationAreaCards,
}: {
  inventoryAreaRef: React.RefObject<HTMLDivElement | null>;
  inventory: CardType[];
  setInventory: (
    inventory: CardType[] | ((prev: CardType[]) => CardType[])
  ) => void;
  cardDatabase: any;
  setCombinationAreaCards: (
    cards: CardType[] | ((prev: CardType[]) => CardType[])
  ) => void;
}) => {
  const [activeTab, setActiveTab] = useState("inventory");

  const tabs: Tab[] = [
    { id: "inventory", label: "Inventory" },
    { id: "equipment", label: "Equipment" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "inventory":
        return (
          <InventoryBox
            inventoryAreaRef={inventoryAreaRef}
            inventory={inventory}
            setInventory={setInventory}
            cardDatabase={cardDatabase}
            setCombinationAreaCards={setCombinationAreaCards}
          />
        );
      case "equipment":
        return (
          <div className="w-full h-full">
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Equipment
              </h2>
              <div className="flex-1 flex justify-center items-center">
                <div className="text-gray-500">
                  Equipment Tab - Coming soon!
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-t-lg">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">{renderTabContent()}</div>
    </div>
  );
};

export default TabbedComponent;
