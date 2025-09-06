import type { User } from '@prisma/client';
import { createClient } from 'redis';

const client = createClient();
await client.connect()

export async function createUserInEngine(user: User) {
  await client.xAdd('trades', '*', {
    type: 'USER_CREATED',
    data: JSON.stringify({

        email: user.email,
        id: user.id,
    })
  });
}
