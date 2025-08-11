export interface Card {
  id: number;
  type: string;
  quantity: number;
  location: "inventory" | "combination";
}
