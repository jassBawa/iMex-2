'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrading } from '@/providers/trading-context';
import { useSymbolPrice } from '@/lib/price-store';

const assets = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'SOLUSDT', name: 'Solana' },
];
const formatPrice = (price: number) =>
  price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  });

function AssetRow({
  symbol,
  name,
  onSelect,
}: {
  symbol: string;
  name: string;
  onSelect: (s: string) => void;
}) {
  const price = useSymbolPrice(symbol);
  const bid = price?.bid ?? null;
  const ask = price?.ask ?? null;
  return (
    <div
      onClick={() => onSelect(symbol)}
      className="w-full grid grid-cols-3 gap-2 items-center py-3 px-3 rounded-lg hover:bg-accent/30 cursor-pointer transition-all duration-200 border border-transparent hover:border-accent/50"
    >
      <div className="space-y-1">
        <div className="font-semibold text-sm">{symbol}</div>
        <div className="text-xs text-muted-foreground truncate">{name}</div>
      </div>
      <div className="text-right">
        <div className="text-price text-sm font-semibold text-success">
          {bid === null ? '-' : formatPrice(bid)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-price text-sm font-semibold text-danger">
          {ask === null ? '-' : formatPrice(ask)}
        </div>
      </div>
    </div>
  );
}

const Assets = () => {
  const { setSymbol } = useTrading();

  return (
    <Card className="trading-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-title">Assets Chart</CardTitle>
        <div className="grid grid-cols-3 mt-4 gap-2 text-xs text-muted-foreground font-medium">
          <span className="text-center">Asset</span>
          <span className="text-center">Bid</span>
          <span className="text-center">Ask</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {assets.map((asset) => (
            <AssetRow
              key={asset.symbol}
              symbol={asset.symbol}
              name={asset.name}
              onSelect={setSymbol}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Assets;
