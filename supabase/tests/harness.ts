import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const SUPABASE_DIR = join(import.meta.dirname, "..");

/**
 * The parts of a Supabase database our migrations depend on: the API roles,
 * a minimal auth schema, and the default grants Supabase applies to `public`.
 */
const SUPABASE_STUBS = /* sql */ `
  create role anon nologin noinherit;
  create role authenticated nologin noinherit;
  create role service_role nologin noinherit bypassrls;

  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    email_confirmed_at timestamptz
  );
  -- Same definition as Supabase's: reads the legacy per-claim setting or the
  -- claims JSON that PostgREST sets for each request.
  create function auth.uid() returns uuid language sql stable as $$
    select coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    )::uuid
  $$;

  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

/** Migrations that need Supabase services PGlite doesn't have (storage, pg_cron). */
const SKIPPED_MIGRATIONS = ["_storage.sql", "_release_expired_orders_job.sql"];

let template: Promise<File | Blob> | undefined;

/**
 * A fresh, fully migrated and seeded database. The first call builds it; later
 * calls restore a snapshot, so each test gets an isolated copy quickly.
 */
export async function createTestDatabase() {
  template ??= buildDatabase().then((db) => db.dumpDataDir("none"));
  return PGlite.create({ loadDataDir: await template });
}

async function buildDatabase() {
  const db = await PGlite.create();
  await db.exec(SUPABASE_STUBS);

  const migrationsDir = join(SUPABASE_DIR, "migrations");
  const migrations = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .filter((name) => !SKIPPED_MIGRATIONS.some((suffix) => name.endsWith(suffix)))
    .sort();
  for (const name of migrations) {
    await db.exec(readFileSync(join(migrationsDir, name), "utf8"));
  }
  await db.exec(readFileSync(join(SUPABASE_DIR, "seed.sql"), "utf8"));

  return db;
}

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>;

/** Runs `fn` as an API role (and optionally a signed-in user), then resets. */
export async function asRole<T>(
  db: TestDatabase,
  role: "anon" | "authenticated" | "service_role",
  fn: () => Promise<T>,
  userId?: string,
): Promise<T> {
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? ""]);
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}

export async function createUser(db: TestDatabase, email: string, confirmed = true) {
  const { rows } = await db.query<{ id: string }>(
    `insert into auth.users (email, email_confirmed_at) values ($1, $2) returning id`,
    [email, confirmed ? new Date().toISOString() : null],
  );
  return rows[0].id;
}

/** Creates an active product with the given stock per size; returns variant ids by size. */
export async function createProduct(
  db: TestDatabase,
  {
    slug,
    price,
    stock,
    status = "active",
  }: { slug: string; price: number; stock: Record<string, number>; status?: string },
) {
  const { rows: products } = await db.query<{ id: string }>(
    `insert into public.products (slug, name, category_id, price, status, color_name)
     select $1, initcap(replace($1, '-', ' ')), id, $2, $3::public.product_status, 'Black'
     from public.categories where slug = 'tees'
     returning id`,
    [slug, price, status],
  );
  const productId = products[0].id;

  await db.query(
    `insert into public.product_images (product_id, path, sort_order) values ($1, $2, 0)`,
    [productId, `${slug}/front.jpg`],
  );

  const variants: Record<string, string> = {};
  for (const [size, quantity] of Object.entries(stock)) {
    const { rows } = await db.query<{ id: string }>(
      `insert into public.product_variants (product_id, size, stock) values ($1, $2, $3) returning id`,
      [productId, size, quantity],
    );
    variants[size] = rows[0].id;
  }
  return { productId, variants };
}

export async function stockOf(db: TestDatabase, variantId: string) {
  const { rows } = await db.query<{ stock: number }>(
    `select stock from public.product_variants where id = $1`,
    [variantId],
  );
  return rows[0].stock;
}
