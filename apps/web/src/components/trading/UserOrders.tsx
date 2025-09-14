'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useClosedOrders, useOpenOrders } from '@/hooks/useOrders';
import { useCloseOrder } from '@/hooks/useCloseOrder';
import { CheckCircle, Clock, X } from 'lucide-react';
import { useState } from 'react';

function fmtTs(ts: string | number | Date | null | undefined) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

const Orders = () => {
  const [tab, setTab] = useState<'open' | 'closed'>('open');
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [orderToClose, setOrderToClose] = useState<any>(null);

  // Only fetch data for the currently active tab - no background fetching
  const shouldFetchOpen = tab === 'open';
  const shouldFetchClosed = tab === 'closed';

  const { data: openOrders = [], isLoading: loadingOpen } =
    useOpenOrders(shouldFetchOpen);
  const { data: closedOrders = [], isLoading: loadingClosed } =
    useClosedOrders(shouldFetchClosed);

  const closeOrderMutation = useCloseOrder();

  const handleCloseOrderClick = (order: any) => {
    setOrderToClose(order);
    setShowCloseDialog(true);
  };

  const handleConfirmClose = async () => {
    if (!orderToClose) return;

    try {
      await closeOrderMutation.mutateAsync({
        orderId: orderToClose.id || orderToClose.orderId,
      });
      setShowCloseDialog(false);
      setOrderToClose(null);
    } catch (error) {
      console.error('Failed to close order:', error);
    }
  };

  const handleCancelClose = () => {
    setShowCloseDialog(false);
    setOrderToClose(null);
  };

  const cryptoRandom = () => Math.random().toString(36).slice(2);
  const normalize = (o: any) => {
    // Try to map engine/db fields
    const asset = o.asset || o.symbol || '-';
    const type = (
      o.side === 'LONG' ? 'buy' : o.side === 'SHORT' ? 'sell' : o.type || '-'
    ).toLowerCase();
    const quantity = Number(o.quantity ?? o.qty ?? 0);
    const openPrice = Number(
      o.openPrice ?? o.tradeOpeningPrice ?? o.price ?? 0
    );
    const closePrice = Number(o.closePrice ?? 0);
    const lev = o.leverage ?? o.lev ?? 1;
    const leverage = typeof lev === 'number' ? `${lev}x` : String(lev);
    const status = o.status || (o.closedAt ? 'closed' : 'open');
    const timestamp = fmtTs(o.createdAt || o.time || Date.now());
    const total =
      openPrice && quantity ? Number((openPrice * quantity).toFixed(2)) : 0;

    // For open orders
    const margin = o.margin ? Number(o.margin.toFixed(2)) : 0;
    const tradeOpeningPrice = o.tradeOpeningPrice
      ? Number(o.tradeOpeningPrice.toFixed(2))
      : 0;

    // For closed orders
    const pnl = o.pnl ? Number(o.pnl.toFixed(2)) : 0;
    const reason = o.reason || 'Unknown';
    const liquidated = o.liquidated || false;
    const slippage = o.slippage ? `${o.slippage}%` : '-';

    return {
      id: o.id || o.orderId || cryptoRandom(),
      asset,
      type,
      quantity,
      openPrice,
      closePrice,
      leverage,
      status,
      timestamp,
      total,
      margin,
      tradeOpeningPrice,
      pnl,
      reason,
      liquidated,
      slippage,
    };
  };

  return (
    <Card className="trading-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-title">Orders</CardTitle>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <Tabs
          value={tab}
          onValueChange={(v: any) => setTab(v)}
          className="space-y-4"
        >
          {/* 
            Note: Only the active tab's data is fetched to avoid engine-heavy background tasks.
            When switching tabs, the new tab's data will be fetched on-demand.
          */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="open"
              className="flex items-center space-x-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Clock className="h-4 w-4" />
              <span>Open Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="closed"
              className="flex items-center space-x-2 data-[state=active]:bg-success/10 data-[state=active]:text-success"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Closed Orders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-3">
            {loadingOpen ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-5 w-12" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-7 w-7" />
                    </div>
                  </div>
                ))}
              </div>
            ) : openOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You have no open orders yet
              </div>
            ) : (
              <div className="space-y-2 min-w-[800px] lg:min-w-0">
                {openOrders.map((raw) => {
                  const order = normalize(raw);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/20 to-muted/30 border hover:from-muted/30 hover:to-muted/40 transition-all duration-200"
                    >
                      {/* Left Section - Asset & Type */}
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            order.type === 'buy' ? 'default' : 'secondary'
                          }
                          className={`text-xs ${
                            order.type === 'buy'
                              ? 'bg-green-500/20 text-green-600 border-green-500/30'
                              : 'bg-red-500/20 text-red-600 border-red-500/30'
                          }`}
                        >
                          {order.type.toUpperCase()}
                        </Badge>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {order.asset}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.quantity} @ {order.leverage}
                          </div>
                        </div>
                      </div>

                      {/* Center Section - Price Info */}
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="text-center">
                          <div className="text-muted-foreground">Open</div>
                          <div className="font-medium text-blue-600">
                            ${order.openPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Trade</div>
                          <div className="font-medium text-purple-600">
                            ${order.tradeOpeningPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Margin</div>
                          <div className="font-medium text-orange-600">
                            ${order.margin}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Slippage</div>
                          <div className="font-medium text-cyan-600">
                            {order.slippage}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Time & Action */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {order.timestamp}
                          </div>
                          <div className="text-xs font-medium text-indigo-600">
                            {order.status}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                          onClick={() => handleCloseOrderClick(raw)}
                          disabled={closeOrderMutation.isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-3">
            {loadingClosed ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-5 w-12" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : closedOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You have no closed orders yet
              </div>
            ) : (
              <div className="space-y-2 min-w-[800px] lg:min-w-0">
                {closedOrders.map((raw) => {
                  const order = normalize(raw);
                  const isProfit = order.pnl > 0;
                  const isLoss = order.pnl < 0;

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/20 to-muted/30 border hover:from-muted/30 hover:to-muted/40 transition-all duration-200"
                    >
                      {/* Left Section - Asset & Type */}
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            order.liquidated
                              ? 'bg-red-500/20 text-red-600 border-red-500/30'
                              : order.type === 'buy'
                                ? 'bg-green-500/20 text-green-600 border-green-500/30'
                                : 'bg-red-500/20 text-red-600 border-red-500/30'
                          }`}
                        >
                          {order.type.toUpperCase()}
                        </Badge>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {order.asset}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.quantity} @ {order.leverage}
                          </div>
                        </div>
                        {order.liquidated && (
                          <Badge variant="destructive" className="text-xs">
                            Liquidated
                          </Badge>
                        )}
                      </div>

                      {/* Center Section - Price Info */}
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="text-center">
                          <div className="text-muted-foreground">Open</div>
                          <div className="font-medium text-blue-600">
                            ${order.openPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Close</div>
                          <div className="font-medium text-purple-600">
                            ${order.closePrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">PnL</div>
                          <div
                            className={`font-medium ${
                              isProfit
                                ? 'text-green-600'
                                : isLoss
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {isProfit ? '+' : ''}${order.pnl}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Slippage</div>
                          <div className="font-medium text-cyan-600">
                            {order.slippage}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Time & Reason */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {order.timestamp}
                          </div>
                          <div className="text-xs font-medium text-indigo-600">
                            {order.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Close Order Confirmation Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {orderToClose && (
            <div className="bg-muted/30 rounded-lg p-3 my-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {orderToClose.asset || 'Unknown Asset'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {orderToClose.side === 'LONG'
                      ? 'BUY'
                      : orderToClose.side === 'SHORT'
                        ? 'SELL'
                        : orderToClose.type || 'Unknown'}{' '}
                    • {orderToClose.quantity || 0} @ ${orderToClose.margin || 0}{' '}
                    margin
                  </div>
                </div>
                <Badge
                  variant={
                    orderToClose.side === 'LONG' ? 'default' : 'secondary'
                  }
                >
                  {orderToClose.side === 'LONG'
                    ? 'LONG'
                    : orderToClose.side === 'SHORT'
                      ? 'SHORT'
                      : 'UNKNOWN'}
                </Badge>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelClose}
              disabled={closeOrderMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              disabled={closeOrderMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {closeOrderMutation.isPending ? 'Closing...' : 'Close Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default Orders;
