import { Hammer, HelpCircle, LucideIcon, Wrench } from "lucide-react";

// Gets the cards icon or fallback icon
export const getIcon = (iconName: string): LucideIcon => {
  const iconMap: { [key: string]: LucideIcon } = {
    Hammer,
    Wrench,
  };

  return iconMap[iconName] || HelpCircle;
};
