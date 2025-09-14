'use client';

import { useSyncExternalStore } from 'react';

type SymbolPrice = {
  bid: number;
  ask: number;
  time: number;
};

// Simple external store to avoid re-rendering the whole tree
const listeners = new Set<() => void>();
const priceMap = new Map<string, SymbolPrice>();

function emitChange() {
  listeners.forEach((l) => l());
}

export function setSymbolPrice(symbol: string, next: Partial<SymbolPrice>) {
  const prev = priceMap.get(symbol) || { bid: 0, ask: 0, time: 0 };
  const merged: SymbolPrice = {
    bid: next.bid ?? prev.bid,
    ask: next.ask ?? prev.ask,
    time: next.time ?? Date.now(),
  };
  priceMap.set(symbol, merged);
  emitChange();
}

export function getSymbolPrice(symbol: string): SymbolPrice | undefined {
  return priceMap.get(symbol);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSymbolPrice(symbol: string) {
  return useSyncExternalStore(
    subscribe,
    () => getSymbolPrice(symbol),
    () => getSymbolPrice(symbol)
  );
}
