/**
 * Regenerates src/lib/supabase/database.types.ts from the SQL migrations.
 *
 * Boots the migrated schema in an in-process Postgres (PGlite), exposes it on a
 * local socket, and points the Supabase CLI type generator at it — so types
 * always match the migrations, with no Docker or live project needed.
 */
import { execFile, execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { promisify } from "node:util";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { createTestDatabase } from "../supabase/tests/harness.ts";

const OUTPUT = "src/lib/supabase/database.types.ts";

/** Asks the OS for an unused port so this never clashes with a running database. */
function freePort() {
  return new Promise<number>((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() =>
        typeof address === "object" && address ? resolve(address.port) : reject(),
      );
    });
  });
}

const PORT = await freePort();

const db = await createTestDatabase();
const server = new PGLiteSocketServer({ db, host: "127.0.0.1", port: PORT });
await server.start();

try {
  // Must be async: the socket server lives in this process's event loop.
  const { stdout: types } = await promisify(execFile)(
    "npx",
    [
      "supabase",
      "gen",
      "types",
      "typescript",
      "--schema",
      "public",
      "--db-url",
      `postgresql://postgres:postgres@127.0.0.1:${PORT}/postgres?sslmode=disable`,
    ],
    { encoding: "utf8" },
  );
  writeFileSync(OUTPUT, types);
} finally {
  await server.stop();
  await db.close();
}

execFileSync("npx", ["prettier", "--write", OUTPUT], { stdio: "inherit" });
