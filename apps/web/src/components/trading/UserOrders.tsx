'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClosedOrders, useOpenOrders } from '@/hooks/useOrders';
import { CheckCircle, Clock, X } from 'lucide-react';
import { useState } from 'react';

function fmtTs(ts: string | number | Date | null | undefined) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

const Orders = () => {
  const [tab, setTab] = useState<'open' | 'closed'>('open');

  // Only fetch data for the currently active tab - no background fetching
  const shouldFetchOpen = tab === 'open';
  const shouldFetchClosed = tab === 'closed';

  const { data: openOrders = [], isLoading: loadingOpen } =
    useOpenOrders(shouldFetchOpen);
  const { data: closedOrders = [], isLoading: loadingClosed } =
    useClosedOrders(shouldFetchClosed);

  const cryptoRandom = () => Math.random().toString(36).slice(2);
  const normalize = (o: any) => {
    // Try to map engine/db fields
    const asset = o.asset || o.symbol || '-';
    const type = (
      o.side === 'LONG' ? 'buy' : o.side === 'SHORT' ? 'sell' : o.type || '-'
    ).toLowerCase();
    const quantity = Number(o.quantity ?? o.qty ?? 0);
    const price = Number(o.tradeOpeningPrice ?? o.price ?? 0);
    const lev = o.leverage ?? o.lev ?? 1;
    const leverage =
      typeof lev === 'number' ? `${Math.round(lev / 100)}x` : String(lev);
    const status = o.status || (o.closedAt ? 'closed' : 'open');
    const timestamp = fmtTs(o.createdAt || o.time || Date.now());
    const total = price && quantity ? Number((price * quantity).toFixed(2)) : 0;
    return {
      id: o.id || o.orderId || cryptoRandom(),
      asset,
      type,
      quantity,
      price,
      leverage,
      status,
      timestamp,
      total,
    };
  };

  return (
    <Card className="trading-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-title">Orders</CardTitle>
      </CardHeader>

      <CardContent>
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
                    <div className="flex items-center space-x-3 w-2/3">
                      <Skeleton className="h-5 w-16" />
                      <div className="space-y-1 w-full">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16 ml-auto" />
                      <Skeleton className="h-3 w-20 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : openOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You have no open orders yet
              </div>
            ) : (
              <div className="space-y-2">
                {openOrders.map((raw) => {
                  const order = normalize(raw);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            order.type === 'buy' ? 'default' : 'secondary'
                          }
                          className={
                            order.type === 'buy'
                              ? 'bg-success/10 text-success'
                              : 'bg-danger/10 text-danger'
                          }
                        >
                          {order.type.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-semibold">{order.asset}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.quantity} @ ${order.price.toLocaleString()} (
                            {order.leverage})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-price">
                            ${order.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.timestamp}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
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
                    <div className="flex items-center space-x-3 w-2/3">
                      <Skeleton className="h-5 w-16" />
                      <div className="space-y-1 w-full">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16 ml-auto" />
                      <Skeleton className="h-3 w-20 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : closedOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You have no closed orders yet
              </div>
            ) : (
              <div className="space-y-2">
                {closedOrders.map((raw) => {
                  const order = normalize(raw);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="opacity-70">
                          {order.type.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-semibold">{order.asset}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.quantity} @ ${order.price.toLocaleString()} (
                            {order.leverage})
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold text-price">
                          ${order.total}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.timestamp}
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
    </Card>
  );
};

export default Orders;
