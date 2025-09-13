'use client';
import { Badge } from '../ui/badge';
import { useBalance } from '@/hooks/useBalance';
import { ModeToggle } from '@/components/ui/mode-toggle';

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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="h-7 w-7 lg:h-8 lg:w-8 bg-primary rounded-lg flex items-center justify-center">
              {/* <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" /> */}
            </div>
            <h1 className="text-display text-lg lg:text-xl font-bold truncate">
              MarketView Pro
            </h1>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="flex items-center space-x-1 text-sm">
              <span className="text-muted-foreground hidden md:inline">
                Balance:
              </span>
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

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
