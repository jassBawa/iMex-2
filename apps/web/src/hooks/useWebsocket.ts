// hooks/useWebSocket.ts
import { useEffect } from 'react';
import { setSymbolPrice } from '@/lib/price-store';

export interface TradeMessage {
  type: 'ASK' | 'BID';
  symbol: string;
  price: number;
  originalPrice: number;
  quantity: number;
  time: number;
}

// keep a shared connection outside the hook
let ws: WebSocket | null = null;
let listeners: ((msg: TradeMessage) => void)[] = [];
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export function useWebSocket(onMessage: (msg: TradeMessage) => void) {
  useEffect(() => {
    // create socket only once
    if (!ws) {
      ws = new WebSocket(WS_URL);

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          // Handle aggregated PRICE_UPDATE payloads from ws service
          if (
            parsed &&
            parsed.type === 'PRICE_UPDATE' &&
            typeof parsed.data === 'string'
          ) {
            const priceMap = JSON.parse(parsed.data) as Record<
              string,
              { buyPrice: number; sellPrice: number; decimal: number }
            >;

            const now = Date.now();

            Object.entries(priceMap).forEach(([pair, p]) => {
              const scale = Math.pow(10, p.decimal || 0);
              const ask = p.buyPrice / scale; // price to buy at
              const bid = p.sellPrice / scale; // price to sell at

              const symbol = mapPairToUiSymbol(pair);

              // Update shared price store
              setSymbolPrice(symbol, { ask, bid, time: now });

              const askMsg: TradeMessage = {
                type: 'ASK',
                symbol,
                price: ask,
                originalPrice: ask,
                quantity: 0,
                time: now,
              };
              const bidMsg: TradeMessage = {
                type: 'BID',
                symbol,
                price: bid,
                originalPrice: bid,
                quantity: 0,
                time: now,
              };

              listeners.forEach((cb) => cb(askMsg));
              listeners.forEach((cb) => cb(bidMsg));
            });

            return;
          }

          // Fallback for legacy single-tick messages
          if (parsed && parsed.type && parsed.symbol && parsed.price) {
            listeners.forEach((cb) => cb(parsed as TradeMessage));
            return;
          }
        } catch (err) {
          console.error('WS parse error', err);
        }
      };

      ws.onclose = () => {
        ws = null;
        listeners = [];
      };
    }

    // register listener for this hook call
    listeners.push(onMessage);

    // cleanup when component unmounts
    return () => {
      listeners = listeners.filter((cb) => cb !== onMessage);

      // if no more listeners, close connection
      if (listeners.length === 0 && ws) {
        ws.close();
        ws = null;
      }
    };
  }, [onMessage]);
}

function mapPairToUiSymbol(pair: string): string {
  // Example inputs: BTC_USDC, ETH_USDC, SOL_USDC
  // UI expects: BTCUSDT, ETHUSDT, SOLUSDT
  const compact = pair.replace('_', '');
  if (compact.endsWith('USDC')) return compact.replace('USDC', 'USDT');
  return compact;
}
