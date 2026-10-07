/* istanbul ignore file -- PG-gated: only runs under DATABASE_TYPE=postgres (test-postgres CI job);
   skipped in the default test job, so its lines would be unread and skew the global coverage gate. */
import 'reflect-metadata';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { createBootDataSource } from '../../pg-boot-migrations';

/**
 * Postgres runtime coverage for the boot-migration advisory lock. Two "replicas" (independent
 * boot paths sharing nothing but the database) start migrating CONCURRENTLY; without the lock
 * both would see an empty migrations ledger and race DDL (duplicate tables / deadlocks). With the
 * lock, one applies the chain while the other blocks in pg_advisory_lock, then applies nothing.
 *
 * Gating: mirrors the repo's PG harness convention exactly (scripts/pg-uuid-smoke.js + the
 * "Test (PostgreSQL migrations)" CI job + 1782400000000-AddMessagesFts.pg.spec.ts) — skip the
 * whole suite unless DATABASE_TYPE=postgres is set; the CI job runs it against a postgres:16
 * service, locally it skips cleanly.
 */
const POSTGRES_ENABLED = process.env.DATABASE_TYPE === 'postgres';

(POSTGRES_ENABLED ? describe : describe.skip)('postgres boot migrations (advisory lock)', () => {
  const schema = process.env.POSTGRES_SCHEMA || 'public';
  const useCustomSearchPath = schema !== 'public';
  let admin: DataSource;

  const connectionOptions = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    username: process.env.DATABASE_USERNAME || 'openwa',
    password: process.env.DATABASE_PASSWORD || 'openwa',
    database: process.env.DATABASE_NAME || 'openwa',
  };

  // The exact options shape app.module.ts hands to createBootDataSource for the postgres data
  // connection: full migration chain, non-public schema via pg's startup search_path (see
  // pg-uuid-smoke.js for why the `options` parameter — not TypeORM's `schema` — is what routes
  // raw DDL to the schema).
  const bootMigratorOptions = (): DataSourceOptions => ({
    type: 'postgres',
    ...connectionOptions,
    migrations: [path.join(__dirname, '..', '*{.ts,.js}')],
    ...(useCustomSearchPath ? { extra: { options: `-c search_path=${schema},public` } } : {}),
  });

  beforeEach(async () => {
    admin = new DataSource({ type: 'postgres', ...connectionOptions });
    await admin.initialize();
    // Fresh schema each test: the CI job shares one service across steps, so wipe whatever the
    // pg-smoke step (or a previous test) left behind — tables AND the migrations ledger.
    await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.query(`CREATE SCHEMA "${schema}"`);
  });

  afterEach(async () => {
    if (admin && admin.isInitialized) {
      await admin.destroy();
    }
  });

  it('serializes two concurrent boot migrators: both resolve, ledger holds one row per migration', async () => {
    // Promise.all starts both boot paths before either can finish — the exact race replicas
    // hit when a deployment scales up against one shared Postgres.
    const [a, b] = await Promise.all([
      createBootDataSource(bootMigratorOptions()),
      createBootDataSource(bootMigratorOptions()),
    ]);

    try {
      const expected = a.migrations.length; // the full chain, loaded from the same glob
      // Unqualified name: resolves through the same session search_path the ledger was written
      // under, exactly like the raw migration SQL.
      const ledger: Array<{ name: string }> = await a.query(`SELECT name FROM "migrations"`);
      expect(ledger).toHaveLength(expected);
      // No migration applied twice — the double-apply shape concurrent migrationsRun produces.
      expect(new Set(ledger.map(row => row.name)).size).toBe(expected);
    } finally {
      await a.destroy();
      await b.destroy();
    }
  }, 120_000);
});
