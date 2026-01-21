export interface MarketOutcome {
  id: string;
  label: string;
  price: number;
  priceChange24h?: number;
  metadata?: Record<string, unknown>;
}

export interface Market {
  id: string;
  title: string;
  outcomes: MarketOutcome[];
  volume24h: number;
  liquidity: number;
  url: string;
  description?: string;
  resolutionDate?: string;
  volume?: number;
  openInterest?: number;
  image?: string;
  category?: string;
  tags?: string[];
}

export interface PriceCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderLevel {
  price: number;
  size: number;
}

export interface OrderBook {
  bids: OrderLevel[];
  asks: OrderLevel[];
  timestamp?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
}
