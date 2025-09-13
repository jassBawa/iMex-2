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
import { useEffect, useMemo, useRef } from 'react';

const formatPrice = (price: number) =>
  price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  });

const PriceChart = () => {
  const { symbol, interval, setInterval } = useTrading();
  const priceRef = useRef<HTMLParagraphElement | null>(null);
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

    // Create chart
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
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

    const handleResize = () => {
      if (chartRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartRef.current.clientWidth,
        });
      }
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
      window.removeEventListener('resize', handleResize);
      timeScale.unsubscribeVisibleTimeRangeChange(handleVisibleRangeChange);
      chart.remove();
      chartInstanceRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol, interval, hasNextPage, fetchNextPage, sortedCandles]);

  // Update series when data changes
  useEffect(() => {
    if (!seriesRef.current) return;
    if (!sortedCandles.length) return;
    seriesRef.current.setData(sortedCandles as CandlestickData<Time>[]);
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

    // Update the last candle with live price
    if (seriesRef.current && lastBarRef.current) {
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
    }
  });

  return (
    <Card className="trading-card h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-title px-3 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-lg">
              {symbol}
            </CardTitle>
            <p
              ref={priceRef}
              className="text-xl font-mono font-bold text-foreground"
            >
              -
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {['1m', '5m', '10m', '30m', '1d'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={timeframe === interval ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setInterval(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            Loading...
          </div>
        ) : error ? (
          <div className="h-96 flex items-center justify-center text-red-500">
            Failed to load candles
          </div>
        ) : (
          <div ref={chartRef} className="h-96 w-full" />
        )}
      </CardContent>
    </Card>
  );
};

export default PriceChart;
