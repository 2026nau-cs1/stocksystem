import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Ensure environment variables are loaded
config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required. Current env keys: ' +
      Object.keys(process.env).join(', ')
  );
}

const dbSslMode = (process.env.DB_SSL || 'require').toLowerCase();
const ssl =
  dbSslMode === 'disable'
    ? false
    : {
        // Supabase requires SSL; local dev can disable with DB_SSL=disable.
        rejectUnauthorized: false,
      };

// Database connection with connection pooling
const client = postgres(process.env.DATABASE_URL, {
  ssl,
  max: 10, // Set pool size
  idle_timeout: 20, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
});

export const db = drizzle(client);
