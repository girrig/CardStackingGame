import { Hammer, HelpCircle, Wrench } from "lucide-react";

// Gets the cards icon or fallback icon
export const getIcon = (iconName) => {
  const iconMap = {
    Hammer,
    Wrench,
  };

  return iconMap[iconName] || HelpCircle;
};
