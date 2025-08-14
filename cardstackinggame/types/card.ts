export interface CardType {
  id: number;
  type: string;
  quantity: number;
  location: "inventory" | "combination";
  x?: number;
  y?: number;
}
