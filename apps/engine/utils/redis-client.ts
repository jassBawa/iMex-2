import { createClient } from 'redis';

const client = createClient();
client.connect();

export { client };
