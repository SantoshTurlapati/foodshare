import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { ENV } from './env.js';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    const dbDir = path.dirname(ENV.DATABASE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new DatabaseSync(ENV.DATABASE_PATH);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');

    // Load and execute schema
    const possibleSchemaPaths = [
      path.join(process.cwd(), 'src', 'db', 'schema.sql'),
      path.join(process.cwd(), 'dist', 'db', 'schema.sql'),
      path.join(process.cwd(), 'schema.sql')
    ];

    for (const schemaPath of possibleSchemaPaths) {
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        dbInstance.exec(schemaSql);
        break;
      }
    }
  }
  return dbInstance;
}

// Auto-expire past-due AVAILABLE donations
export function checkAndExpireDonations(): number {
  const dbSync = getDatabase();
  try {
    const nowIso = new Date().toISOString();
    const expiredRows = dbSync.prepare(`
      SELECT id, title, donor_id FROM food_donations
      WHERE status = 'AVAILABLE' AND expiry_time <= ?
    `).all(nowIso) as { id: number; title: string; donor_id: number }[];

    if (expiredRows && expiredRows.length > 0) {
      const updateStmt = dbSync.prepare(`
        UPDATE food_donations
        SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const timelineStmt = dbSync.prepare(`
        INSERT INTO donation_timeline_events (donation_id, event_type, actor_user_id, title, description)
        VALUES (?, 'EXPIRED', ?, 'Donation Expired', 'The food was not collected before the designated consume-before time.')
      `);

      const notifStmt = dbSync.prepare(`
        INSERT INTO notifications (user_id, donation_id, title, message, type)
        VALUES (?, ?, 'Donation Expired', ?, 'donation_status')
      `);

      for (const item of expiredRows) {
        updateStmt.run(item.id);
        timelineStmt.run(item.id, item.donor_id);
        notifStmt.run(
          item.donor_id,
          item.id,
          `Your donation "${item.title}" has passed its expiry time and is marked as Expired.`
        );
      }
    }
    return expiredRows ? expiredRows.length : 0;
  } catch (err) {
    console.error('Error during auto-expiry check:', err);
    return 0;
  }
}

// Helper wrapper functions
export const db = {
  get<T = any>(query: string, ...params: any[]): T | undefined {
    const database = getDatabase();
    return database.prepare(query).get(...params) as T | undefined;
  },
  all<T = any>(query: string, ...params: any[]): T[] {
    const database = getDatabase();
    return database.prepare(query).all(...params) as T[];
  },
  run(query: string, ...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint } {
    const database = getDatabase();
    return database.prepare(query).run(...params);
  },
  exec(query: string): void {
    const database = getDatabase();
    database.exec(query);
  }
};
