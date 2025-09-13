'use client';
import { BarChart3 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useBalance } from '@/hooks/useBalance';

function Header() {
  const { data: balanceData, isLoading, error } = useBalance();

  const formatBalance = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                {/* <BarChart3 className="h-5 w-5 text-primary-foreground" /> */}
              </div>
              <h1 className="text-display text-xl font-bold">MarketView Pro</h1>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#">Markets</Link>
              <Link href="#">Portfolio</Link>
              <Link href="#">Analytics</Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-success rounded-full"></div>
              <span>Live</span>
            </Badge>

            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Balance:</span>
              {isLoading ? (
                <span className="text-price font-semibold">Loading...</span>
              ) : error ? (
                <span className="text-destructive font-semibold">Error</span>
              ) : balanceData?.balance ? (
                <span className="text-price font-semibold">
                  {formatBalance(
                    balanceData.balance.amount,
                    balanceData.balance.currency
                  )}
                </span>
              ) : (
                <span className="text-price font-semibold">$0.00</span>
              )}
            </div>

            <Button size="sm" className="bg-primary hover:bg-primary-hover">
              Account
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
