import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/fs-test-task'),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    ),
});

const provided = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== '')
);

const parsed = envSchema.safeParse(provided);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');

  console.error(`Invalid env config:\n${details}\n`);
  process.exit(1);
}

export const env = parsed.data;
