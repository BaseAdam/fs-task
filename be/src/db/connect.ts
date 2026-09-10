import mongoose from 'mongoose';

export const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export async function connectDb(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected (${mongoose.connection.name})`);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
