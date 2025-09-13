import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

function mapIntervalToBinance(interval: string): string {
  // Binance supported intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
  if (interval === '10m') return '15m';
  return interval;
}

async function fetchPage(
  symbol: string,
  interval: string,
  endTime?: number | null
) {
  const mapped = mapIntervalToBinance(interval);
  const params = new URLSearchParams({
    symbol,
    interval: mapped,
    limit: '500',
  });
  if (endTime) params.set('endTime', String(endTime));
  const res = await fetch(
    `https://fapi.binance.com/fapi/v1/klines?${params.toString()}`
  );
  if (!res.ok) throw new Error('Failed to fetch candles');

  const klines: any[] = await res.json();
  // Binance returns oldest->newest when using endTime; keep ascending
  return klines.map((kline: any[]) => ({
    time: Math.floor(kline[0] / 1000),
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
  }));
}

export function useCandles(symbol: string, interval: string) {
  const query = useInfiniteQuery({
    queryKey: ['candles', symbol, interval],
    initialPageParam: null as number | null,
    queryFn: ({ pageParam }) => fetchPage(symbol, interval, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      const earliest = lastPage[0]?.time;
      if (!earliest) return undefined;
      return earliest * 1000 - 1; // ms just before earliest open time
    },
    refetchOnWindowFocus: false,
  });

  const flatData = useMemo(() => {
    const pages = query.data?.pages ?? [];
    // pages are already asc individually; concatenate and sort to be safe
    return pages.flat().sort((a, b) => a.time - b.time);
  }, [query.data]);

  return {
    ...query,
    data: flatData,
  } as const;
}
