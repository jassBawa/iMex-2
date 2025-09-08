import { MongoClient } from 'mongodb';

const DB_NAME = 'iMex';

export const mongodbClient = new MongoClient(process.env.MONGODB_URL!);
await mongodbClient.connect();
export const db = mongodbClient.db(DB_NAME);
export type TypeOfMongoClient = MongoClient;
