import { env } from '../config/env.js';
import { connectDb, disconnectDb } from '../db/connect.js';
import { ProductModel } from '../models/product.model.js';
import { products } from './products.js';

async function seed(): Promise<void> {
  await connectDb(env.MONGODB_URI);
  await ProductModel.syncIndexes();

  const operations = products.map((product) => ({
    updateOne: {
      filter: { code: product.code },
      update: { $set: product },
      upsert: true,
    },
  }));

  const result = await ProductModel.bulkWrite(operations);

  console.log(
    `Seeded ${products.length} products (inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}).`
  );

  await disconnectDb();
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
