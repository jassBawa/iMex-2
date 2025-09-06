import { prices, users } from '../memoryDb';
import type { PriceStore, User } from '../types';

export async function handlePriceUpdateEntry(payload: PriceStore) {
  console.log('price update function');

  Object.assign(prices, payload);
  console.log('Updated prices store:', prices);
}

interface UserCreated {
  email: string;
  id: string;
}

export async function handleUserCreation(payload: UserCreated) {
  const data: User = {
    id: payload.id,
    email: payload.email,
    balance: {
      amount: 5000,
      currency: 'USD',
    },
    trades: [],
  };

  users[payload.email] = data;

  console.log('Users:', users);
}
