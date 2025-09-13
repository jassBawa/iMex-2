'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCandles } from '@/hooks/useCandles';
import { TradeMessage, useWebSocket } from '@/hooks/useWebsocket';
import { useTrading } from '@/providers/trading-context';
import {
  CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  IChartApi,
  Time,
} from 'lightweight-charts';
import { useEffect, useMemo, useRef, useCallback } from 'react';

const formatPrice = (price: number) =>
  price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  });

const getCandleTime = (timestamp: number, interval: string): number => {
  const date = new Date(timestamp * 1000);

  switch (interval) {
    case '1m':
      // Round down to the nearest minute
      date.setSeconds(0, 0);
      return Math.floor(date.getTime() / 1000);

    case '5m':
      // Round down to the nearest 5-minute interval
      const minutes = date.getMinutes();
      const roundedMinutes = Math.floor(minutes / 5) * 5;
      date.setMinutes(roundedMinutes, 0, 0);
      return Math.floor(date.getTime() / 1000);

    case '10m':
      // Round down to the nearest 10-minute interval
      const minutes10 = date.getMinutes();
      const roundedMinutes10 = Math.floor(minutes10 / 10) * 10;
      date.setMinutes(roundedMinutes10, 0, 0);
      return Math.floor(date.getTime() / 1000);

    case '30m':
      // Round down to the nearest 30-minute interval
      const minutes30 = date.getMinutes();
      const roundedMinutes30 = Math.floor(minutes30 / 30) * 30;
      date.setMinutes(roundedMinutes30, 0, 0);
      return Math.floor(date.getTime() / 1000);

    case '1d':
      // Round down to the start of the day
      date.setHours(0, 0, 0, 0);
      return Math.floor(date.getTime() / 1000);

    default:
      return Math.floor(timestamp);
  }
};

const PriceChart = () => {
  const { symbol, interval, setInterval } = useTrading();
  const priceRef = useRef<HTMLParagraphElement | null>(null);

  // Responsive chart height function
  const getChartHeight = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 300; // Mobile
      if (window.innerWidth < 1024) return 350; // Tablet
      return 400; // Desktop
    }
    return 400;
  }, []);
  const {
    data: candleData = [],
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCandles(symbol, interval);

  const sortedCandles = useMemo(() => {
    return [...candleData].sort(
      (a, b) => (a.time as number) - (b.time as number)
    );
  }, [candleData]);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const loadingMoreRef = useRef(false);
  const lastBarRef = useRef<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Create chart with responsive sizing

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: getChartHeight(),
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.15)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(59, 130, 246, 0.4)', width: 2 },
        horzLine: { color: 'rgba(59, 130, 246, 0.4)', width: 2 },
      },
      rightPriceScale: { borderColor: 'rgba(148, 163, 184, 0.3)' },
      timeScale: {
        borderColor: 'rgba(148, 163, 184, 0.3)',
        timeVisible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000); // chart gives seconds, JS Date needs ms
          return date.toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata',
          });
        },
      },
    });

    // ✅ Correct API call
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#059669',
      downColor: '#dc2626',
      borderVisible: false,
      wickUpColor: '#059669',
      wickDownColor: '#dc2626',
    });

    seriesRef.current = candlestickSeries;
    chartInstanceRef.current = chart;

    // Debounced resize handler for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (chartRef.current && chartInstanceRef.current) {
          const newHeight = getChartHeight();
          chartInstanceRef.current.applyOptions({
            width: chartRef.current.clientWidth,
            height: newHeight,
          });
        }
      }, 150);
    };
    window.addEventListener('resize', handleResize);

    // Load older candles when scrolled to the left edge
    const timeScale = chart.timeScale();
    const handleVisibleRangeChange = async (range: any) => {
      if (!range || loadingMoreRef.current) return;
      if (!hasNextPage) return;
      if (!sortedCandles.length) return;
      const earliest = sortedCandles[0]?.time;
      if (typeof range.from === 'number' && typeof earliest === 'number') {
        // When left boundary is at or before earliest loaded candle, fetch older
        if (range.from <= earliest) {
          loadingMoreRef.current = true;
          try {
            await fetchNextPage();
          } finally {
            loadingMoreRef.current = false;
          }
        }
      }
    };
    timeScale.subscribeVisibleTimeRangeChange(handleVisibleRangeChange);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      timeScale.unsubscribeVisibleTimeRangeChange(handleVisibleRangeChange);
      chart.remove();
      chartInstanceRef.current = null;
      seriesRef.current = null;
    };
  }, [
    symbol,
    interval,
    hasNextPage,
    fetchNextPage,
    sortedCandles,
    getChartHeight,
  ]);

  // Update series when data changes
  useEffect(() => {
    if (!seriesRef.current) return;
    if (!sortedCandles.length) return;

    // Set all historical data
    seriesRef.current.setData(sortedCandles as CandlestickData<Time>[]);

    // Initialize last bar reference with the most recent candle
    const last = sortedCandles[sortedCandles.length - 1];
    if (last) {
      lastBarRef.current = {
        time: last.time as number,
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
      };
    }

    // Auto-scroll to the rightmost (most recent) candle
    if (chartInstanceRef.current) {
      const timeScale = chartInstanceRef.current.timeScale();
      timeScale.scrollToRealTime();
    }
  }, [sortedCandles]);

  // Ensure top price updates when switching assets (even before first WS tick)
  useEffect(() => {
    if (!priceRef.current) return;
    const last = sortedCandles[sortedCandles.length - 1];
    if (last) {
      priceRef.current.textContent = '$' + formatPrice(last.close);
    } else {
      priceRef.current.textContent = '-';
    }
  }, [symbol, sortedCandles]);

  useWebSocket((data: TradeMessage) => {
    if (data.symbol !== symbol) return;

    // Update the top price immediately
    if (priceRef.current) {
      priceRef.current.textContent = '$' + formatPrice(data.price);
    }

    // Update the last candle with live price or create new candle
    if (seriesRef.current) {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const currentCandleTime = getCandleTime(now, interval);

      if (lastBarRef.current) {
        const lastCandleTime = lastBarRef.current.time;

        // If we're still in the same candle timeframe, update the existing candle
        if (currentCandleTime === lastCandleTime) {
          const prev = lastBarRef.current;
          const updated = {
            time: prev.time,
            open: prev.open,
            high: Math.max(prev.high, data.price),
            low: Math.min(prev.low, data.price),
            close: data.price,
          };
          lastBarRef.current = updated;
          seriesRef.current.update(updated);
        } else {
          // New candle timeframe - create new candle
          const newCandle = {
            time: currentCandleTime,
            open: data.price,
            high: data.price,
            low: data.price,
            close: data.price,
          };
          lastBarRef.current = newCandle;
          seriesRef.current.update(newCandle);
        }
      } else if (sortedCandles.length > 0) {
        // Initialize with last candle if we have data
        const last = sortedCandles[sortedCandles.length - 1];
        const currentCandleTime = getCandleTime(now, interval);

        if (currentCandleTime === last.time) {
          // Update existing last candle
          const updated = {
            time: last.time,
            open: last.open,
            high: Math.max(last.high, data.price),
            low: Math.min(last.low, data.price),
            close: data.price,
          };
          lastBarRef.current = updated;
          seriesRef.current.update(updated);
        } else {
          // Create new candle
          const newCandle = {
            time: currentCandleTime,
            open: data.price,
            high: data.price,
            low: data.price,
            close: data.price,
          };
          lastBarRef.current = newCandle;
          seriesRef.current.update(newCandle);
        }
      }
    }
  });

  return (
    <Card className="trading-card h-full w-full min-h-0 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <CardTitle className="text-title px-2 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-sm sm:text-lg sm:px-3">
              {symbol}
            </CardTitle>
            <p
              ref={priceRef}
              className="text-lg font-mono font-bold text-foreground sm:text-xl"
            >
              -
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:space-x-2 sm:gap-0">
            {['1m', '5m', '10m', '30m', '1d'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={timeframe === interval ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs sm:h-8 sm:px-3 min-w-[2rem]"
                onClick={() => setInterval(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center sm:h-96">
            <div className="text-sm sm:text-base">Loading...</div>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-red-500 sm:h-96">
            <div className="text-sm sm:text-base">Failed to load candles</div>
          </div>
        ) : (
          <div ref={chartRef} className="h-64 w-full sm:h-96" />
        )}
      </CardContent>
    </Card>
  );
};

export default PriceChart;
