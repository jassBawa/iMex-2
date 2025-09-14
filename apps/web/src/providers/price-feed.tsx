'use client';

import { useWebSocket, TradeMessage } from '@/hooks/useWebsocket';

export function PriceFeed() {
  // Initialize shared websocket and price-store updates globally
  useWebSocket((_msg: TradeMessage) => {});
  return null;
}
