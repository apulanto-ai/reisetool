import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = env.DATABASE_URL || 'data/reisetool.db';
fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });

const client = new Database(dbPath);
client.pragma('journal_mode = WAL');
client.pragma('foreign_keys = ON');

export const db = drizzle(client, { schema });

// Migrationen laufen einmal beim Serverstart — der Container migriert sich selbst.
migrate(db, { migrationsFolder: env.MIGRATIONS_DIR || 'drizzle' });
