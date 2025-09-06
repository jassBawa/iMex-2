
interface Balance{
    amount: number;
    currency: string
}

interface Asset {
    name: string;
    symbol: string;
    buyPrice: number;
    sellPrice:number
    decimals:number;
}

export interface OpenTrade {
    id: string;
    openPrice: number;
    closePrice?: number;
    leverage: number;
    pnl: number;
    asset: Asset;
    liquidated: boolean;
    createdAt: Date;
}

interface User{
    id: string
    email: string;
    balance: Balance
    trades: OpenTrade[]
}

export const users:Record<string,User> = {}
