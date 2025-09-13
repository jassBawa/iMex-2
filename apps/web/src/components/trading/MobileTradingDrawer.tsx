'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useCreateOrder } from '@/hooks/useCreateOrder';
import { useWebSocket } from '@/hooks/useWebsocket';
import { useTrading } from '@/providers/trading-context';
import { TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import z from 'zod';

const orderSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().min(0.00000001, 'Quantity must be > 0'),
  leverage: z.number().min(1, 'Leverage must be > 0'),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
});

type TradeMsg = {
  type: 'ASK' | 'BID';
  symbol: string;
  price: number;
  time: number;
};

type OrderInput = z.infer<typeof orderSchema>;

const DEC_PLACES_QTY = 8; // BTC precision

const isValidDecimal = (s: string, decimals = DEC_PLACES_QTY) => {
  if (s === '') return true;
  const v = s.replace(',', '.');
  const re = new RegExp(`^\\d*(?:\\.\\d{0,${decimals}})?$`);
  return re.test(v);
};

const toNumber = (s: string) => {
  if (!s) return 0;
  const v = s.replace(',', '.');
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtUSD = (n: number) =>
  n
    ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

export default function MobileTradingDrawer() {
  const { symbol } = useTrading();

  // live price
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // shared inputs
  const [buyQty, setBuyQty] = useState<string>('');
  const [sellQty, setSellQty] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(1);
  const [slippage, setSlippage] = useState<number>(1); // Default 1% slippage
  const orderMutation = useCreateOrder();
  const [error, setError] = useState<string | null>(null);

  // WebSocket: update price
  useWebSocket((msg: TradeMsg) => {
    if (msg.symbol !== symbol) return;
    setCurrentPrice(msg.price);
  });

  // margin = price × qty
  const buyMargin = useMemo(() => {
    const qty = toNumber(buyQty);
    return currentPrice && qty ? currentPrice * qty : 0;
  }, [buyQty, currentPrice]);

  const sellMargin = useMemo(() => {
    const qty = toNumber(sellQty);
    return currentPrice && qty ? currentPrice * qty : 0;
  }, [sellQty, currentPrice]);

  // position size = margin × leverage
  const buyPositionSize = useMemo(
    () => buyMargin * leverage,
    [buyMargin, leverage]
  );
  const sellPositionSize = useMemo(
    () => sellMargin * leverage,
    [sellMargin, leverage]
  );

  async function handlePlaceOrder(side: 'BUY' | 'SELL') {
    setError(null);

    try {
      const qty = side === 'BUY' ? toNumber(buyQty) : toNumber(sellQty);
      const uiSide = side === 'BUY' ? 'LONG' : 'SHORT';
      const asset = symbol.replace('USDT', '_USDC');
      const tradeOpeningPrice = currentPrice || 0;

      // Convert slippage percentage to basis points (1% = 100 basis points)
      const slippageInBasisPoints = slippage * 100;

      // Leverage expected as whole number (e.g., 10000 for 100x) per spec
      const scaledLeverage = leverage * 100;

      await orderMutation.mutateAsync({
        asset,
        side: uiSide as 'LONG' | 'SHORT',
        quantity: qty,
        leverage: scaledLeverage,
        slippage: slippageInBasisPoints,
        tradeOpeningPrice,
      });
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    }
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="fixed bottom-6 left-4 right-4 z-50 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg lg:hidden flex items-center justify-center space-x-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5" />
          <span>Buy/Sell</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center">Trade {symbol}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          <Tabs defaultValue="buy" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="buy"
                className="flex items-center space-x-2 data-[state=active]:bg-success/10 data-[state=active]:text-success"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Buy</span>
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                className="flex items-center space-x-2 data-[state=active]:bg-danger/10 data-[state=active]:text-danger"
              >
                <TrendingDown className="h-4 w-4" />
                <span>Sell</span>
              </TabsTrigger>
            </TabsList>

            {/* BUY */}
            <TabsContent value="buy" className="space-y-4">
              <div className="space-y-4">
                {/* Quantity */}
                <div className="space-y-2">
                  <Label
                    htmlFor="mobile-buy-quantity"
                    className="text-sm font-medium"
                  >
                    Quantity (BTC)
                  </Label>
                  <Input
                    id="mobile-buy-quantity"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.001"
                    className="text-price"
                    value={buyQty}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      if (isValidDecimal(v, DEC_PLACES_QTY)) setBuyQty(v);
                    }}
                    onBlur={(e) => {
                      let v = e.target.value.replace(',', '.');
                      if (v.endsWith('.')) v = v.slice(0, -1);
                      if (isValidDecimal(v)) setBuyQty(v);
                    }}
                  />
                </div>

                {/* Leverage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Leverage</Label>
                    <span className="text-sm font-semibold text-primary">
                      {leverage}x
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={100}
                    step={1}
                    value={[leverage]}
                    onValueChange={(v) => setLeverage(v[0] ?? 1)}
                  />
                </div>

                {/* Slippage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Slippage</Label>
                    <span className="text-sm font-semibold text-primary">
                      {slippage}%
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={0.1}
                    value={[slippage]}
                    onValueChange={(v) => setSlippage(Math.max(1, v[0] ?? 1))}
                  />
                  <div className="text-xs text-muted-foreground">
                    Minimum 1% slippage
                  </div>
                </div>

                {/* Margin + Position size */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="text-price font-semibold">
                    {fmtUSD(buyMargin)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Position Size</span>
                  <span className="text-price font-semibold">
                    {fmtUSD(buyPositionSize)}
                  </span>
                </div>

                <Button
                  onClick={() => handlePlaceOrder('BUY')}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  disabled={orderMutation.isPending}
                >
                  {orderMutation.isPending
                    ? 'Placing Order...'
                    : 'Place Buy Order'}
                </Button>
              </div>
            </TabsContent>

            {/* SELL */}
            <TabsContent value="sell" className="space-y-4">
              <div className="space-y-4">
                {/* Quantity */}
                <div className="space-y-2">
                  <Label
                    htmlFor="mobile-sell-quantity"
                    className="text-sm font-medium"
                  >
                    Quantity (BTC)
                  </Label>
                  <Input
                    id="mobile-sell-quantity"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.001"
                    className="text-price"
                    value={sellQty}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      if (isValidDecimal(v, DEC_PLACES_QTY)) setSellQty(v);
                    }}
                    onBlur={(e) => {
                      let v = e.target.value.replace(',', '.');
                      if (v.endsWith('.')) v = v.slice(0, -1);
                      if (isValidDecimal(v)) setSellQty(v);
                    }}
                  />
                </div>

                {/* Leverage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Leverage</Label>
                    <span className="text-sm font-semibold text-primary">
                      {leverage}x
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={100}
                    step={1}
                    value={[leverage]}
                    onValueChange={(v) => setLeverage(v[0] ?? 1)}
                  />
                </div>

                {/* Slippage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Slippage</Label>
                    <span className="text-sm font-semibold text-primary">
                      {slippage}%
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={0.1}
                    value={[slippage]}
                    onValueChange={(v) => setSlippage(Math.max(1, v[0] ?? 1))}
                  />
                  <div className="text-xs text-muted-foreground">
                    Minimum 1% slippage
                  </div>
                </div>

                {/* Margin + Position size */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="text-price font-semibold">
                    {fmtUSD(sellMargin)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Position Size</span>
                  <span className="text-price font-semibold">
                    {fmtUSD(sellPositionSize)}
                  </span>
                </div>

                <Button
                  onClick={() => handlePlaceOrder('SELL')}
                  className="w-full bg-danger hover:bg-danger/90 text-danger-foreground"
                  disabled={orderMutation.isPending}
                >
                  {orderMutation.isPending
                    ? 'Placing Order...'
                    : 'Place Sell Order'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
