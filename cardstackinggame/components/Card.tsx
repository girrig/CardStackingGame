import { CardType } from "@/types/card";
import { useDraggable } from "@dnd-kit/core";

const Card = ({
  card,
  cardDatabase,
  onClick,
}: {
  card: CardType;
  cardDatabase: any;
  onClick?: (card: CardType) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: {
      card,
    },
  });

  const cardData = cardDatabase[card.type];
  if (!cardData) return null; // Don't render if card data not loaded yet
  const IconComponent = cardData.icon;

  return (
    <div
      ref={setNodeRef}
      className={`w-24 h-32 bg-white border-2 border-gray-300 rounded cursor-grab hover:shadow-md transition-all flex flex-col items-center justify-center relative select-none ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => onClick && onClick(card)}
      {...listeners}
      {...attributes}
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
