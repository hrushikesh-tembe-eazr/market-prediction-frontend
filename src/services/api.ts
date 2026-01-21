import axios from 'axios';
import type { Market, PriceCandle, OrderBook, ApiResponse } from '../types/market';

const API_BASE_URL = 'http://localhost:3847/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Exchange = 'polymarket' | 'kalshi';

export async function fetchMarkets(
  exchange: Exchange,
  params?: { limit?: number; sort?: string }
): Promise<Market[]> {
  const response = await api.post<ApiResponse<Market[]>>(
    `/${exchange}/fetchMarkets`,
    { args: params ? [params] : [] }
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch markets');
  }

  return response.data.data;
}

export async function searchMarkets(
  exchange: Exchange,
  query: string,
  params?: { limit?: number }
): Promise<Market[]> {
  const args: unknown[] = [query];
  if (params) args.push(params);

  const response = await api.post<ApiResponse<Market[]>>(
    `/${exchange}/searchMarkets`,
    { args }
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to search markets');
  }

  return response.data.data;
}

export async function fetchOHLCV(
  exchange: Exchange,
  outcomeId: string,
  params: { resolution: string; limit?: number }
): Promise<PriceCandle[]> {
  const response = await api.post<ApiResponse<PriceCandle[]>>(
    `/${exchange}/fetchOHLCV`,
    { args: [outcomeId, params] }
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch OHLCV');
  }

  return response.data.data;
}

export async function fetchOrderBook(
  exchange: Exchange,
  outcomeId: string
): Promise<OrderBook> {
  const response = await api.post<ApiResponse<OrderBook>>(
    `/${exchange}/fetchOrderBook`,
    { args: [outcomeId] }
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch order book');
  }

  return response.data.data;
}
