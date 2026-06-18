export type Role = "master" | "user";
export type CardQuality = "MT" | "NM" | "EX" | "GD" | "LP" | "PL" | "PO";
export type CardStatus = "actual" | "history";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  card_name: string;
  card_number: string | null;
  card_id: string | null;
  set_name: string | null;
  quality: CardQuality;
  price_bought: number | null;
  date_bought: string | null;
  price_sold: number | null;
  date_sold: string | null;
  actual_price: number | null;
  extra_info: string | null;
  status: CardStatus;
  is_wishlist: boolean;
  amount: number;
  collection_type: 'collection' | 'inventory';
  created_at: string;
  updated_at: string;
}

export interface CardWithProfit extends Card {
  profit: number | null;
}

export const QUALITY_OPTIONS: { value: CardQuality; label: string; description: string }[] = [
  { value: "MT", label: "MT", description: "Mint" },
  { value: "NM", label: "NM", description: "Near Mint" },
  { value: "EX", label: "EX", description: "Excellent" },
  { value: "GD", label: "GD", description: "Good" },
  { value: "LP", label: "LP", description: "Light Played" },
  { value: "PL", label: "PL", description: "Played" },
  { value: "PO", label: "PO", description: "Poor" },
];

export const QUALITY_COLORS: Record<CardQuality, string> = {
  MT: "bg-emerald-100 text-emerald-800",
  NM: "bg-green-100 text-green-800",
  EX: "bg-blue-100 text-blue-800",
  GD: "bg-yellow-100 text-yellow-800",
  LP: "bg-orange-100 text-orange-800",
  PL: "bg-red-100 text-red-800",
  PO: "bg-gray-100 text-gray-800",
};

export interface CardLot {
  id: string;
  card_id: string;
  price_bought: number | null;
  date_bought: string | null;
  price_sold: number | null;
  date_sold: string | null;
  status: "actual" | "history";
  created_at: string;
}

export interface CardWithLots extends Card {
  lots: CardLot[];
  quantity: number;
  avg_price_bought: number | null;
}
