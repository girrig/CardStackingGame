import { Hammer, HelpCircle, Wrench } from "lucide-react";

// Gets the cards icon or fallback icon
export const getIcon = (iconName: any) => {
  const iconMap: any = {
    Hammer,
    Wrench,
  };

  return iconMap[iconName] || HelpCircle;
};
