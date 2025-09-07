interface Balance {
  amount: number;
  currency: string;
}

export interface Trade {
  id: string;
  openPrice: number;
  closePrice?: number;

  quantity: number;
  leverage: number;
  margin?: number;

  stopLoss?:number;
  takeProfit?:number;
  pnl?: number;
  
  side: string;
  asset: AssetSymbols;
  
  liquidated: boolean;
  createdAt: Date;
  closedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  balance: Balance;
  trades: Trade[];
}

export enum AssetSymbols {
  SOL = 'SOL_USDC',
  ETH = 'ETH_USDC',
  BTC = 'BTC_USDC',
}

export type PriceObj = Partial<{
  [key in AssetSymbols]: AsksBids;
}>;

export interface AsksBids {
  buyPrice: number;
  sellPrice: number;
  decimal: number;
}

export type PriceStore = Partial<Record<AssetSymbols, AsksBids>>; // optional symboling
export type UserStore = Record<string, User>;