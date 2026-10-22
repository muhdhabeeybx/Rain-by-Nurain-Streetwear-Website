import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { STATE_VALUES } from "./nigeria";

describe("NIGERIAN_STATES", () => {
  it("matches the database's nigerian_state domain exactly", () => {
    const migration = readFileSync(
      join(import.meta.dirname, "../../supabase/migrations/20261021120000_init.sql"),
      "utf8",
    );
    const domain = migration.match(
      /create domain public\.nigerian_state[\s\S]*?value in \(([\s\S]*?)\)/,
    );
    const dbStates = [...(domain?.[1] ?? "").matchAll(/'([^']+)'/g)].map((match) => match[1]);

    expect(dbStates).toHaveLength(37);
    expect([...STATE_VALUES].sort()).toEqual(dbStates.sort());
  });
});
