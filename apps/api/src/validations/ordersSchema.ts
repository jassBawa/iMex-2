import z from 'zod';


export const openOrderSchema = z.object({
  asset: z.string(),
  type: z.enum(['LONG', 'SHORT']),
quantity: z.number(),
leverage: z.number(),
slippage: z.number()
});

export const closeOrderSchema = z.object({
    orderId: z.string()
})