import { CardType } from "@/types/card";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef } from "react";

const Card = ({
  card,
  cardDatabase,
  onClick,
}: {
  card: CardType;
  cardDatabase: any;
  onClick?: (card: CardType) => void;
}) => {
  const cardElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cardElementRef.current;
    if (!element) return;

    return draggable({
      element,
      getInitialData: (args) => {
        const rect = element.getBoundingClientRect();
        const offsetX = args.input.clientX - rect.left;
        const offsetY = args.input.clientY - rect.top;

        return {
          card,
          dragOffset: { x: offsetX, y: offsetY },
        };
      },
    });
  }, [card]);

  const cardData = cardDatabase[card.type];
  if (!cardData) return null; // Don't render if card data not loaded yet
  const IconComponent = cardData.icon;

  return (
    <div
      ref={cardElementRef}
      className="w-24 h-32 bg-white border-2 border-gray-300 rounded cursor-grab hover:shadow-md transition-all flex flex-col items-center justify-center relative select-none"
      onClick={() => onClick && onClick(card)}
      draggable={false}
    >
      <IconComponent size={28} color={cardData.color} />
      <div className="text-sm font-medium text-gray-800 mt-2 text-center px-1">
        {cardData.name}
      </div>
      {card.quantity > 1 && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
          {card.quantity}
        </div>
      )}
    </div>
  );
};

export default Card;
