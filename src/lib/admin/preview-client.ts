import "server-only";
import { PREVIEW_SAVE_MESSAGE } from "@/lib/preview";
import { previewTables } from "@/lib/preview-data";

/**
 * Stands in for the admin's database client in preview mode, so every admin
 * page renders with sample data (preview-data.ts) without a backend.
 *
 * It supports the query-builder calls the admin uses: filters, ordering,
 * limits, counts and single rows. Rows already carry their embedded relations,
 * so select lists are not parsed; extra fields are harmless. Anything that
 * writes (insert, update, delete, upsert, rpc, storage) is refused with a
 * message the admin forms show, so nothing pretends to be saved.
 */

type Row = Record<string, unknown>;
type Filter = (row: Row) => boolean;
type Result = { data: unknown; error: { message: string } | null; count: number | null };

const refused: Result = { data: null, error: { message: PREVIEW_SAVE_MESSAGE }, count: null };

/** Reads `a.b` paths, for filters on embedded rows such as "product.status". */
function get(row: Row, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => (value as Row | null)?.[key], row);
}

function compare(a: unknown, b: unknown) {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  return a < b ? -1 : 1;
}

class PreviewQuery implements PromiseLike<Result> {
  private filters: Filter[] = [];
  private orders: { column: string; ascending: boolean }[] = [];
  private max: number | null = null;
  private mode: "many" | "single" | "maybeSingle" = "many";
  private countOnly = false;
  private writes = false;

  constructor(private readonly rows: Row[]) {}

  select(_columns?: string, options?: { count?: string; head?: boolean }) {
    if (options?.head) this.countOnly = true;
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push((row) => get(row, column) === value);
    return this;
  }
  neq(column: string, value: unknown) {
    this.filters.push((row) => get(row, column) !== value);
    return this;
  }
  in(column: string, values: readonly unknown[]) {
    this.filters.push((row) => values.includes(get(row, column)));
    return this;
  }
  lte(column: string, value: unknown) {
    this.filters.push((row) => compare(get(row, column), value) <= 0);
    return this;
  }
  gte(column: string, value: unknown) {
    this.filters.push((row) => compare(get(row, column), value) >= 0);
    return this;
  }
  /** Only the `column.ilike.%term%,…` form the order search uses. */
  or(expression: string) {
    const clauses = expression.split(",").map((clause) => {
      const [column, , pattern = ""] = clause.split(".");
      return { column, term: pattern.replaceAll("%", "").trim().toLowerCase() };
    });
    this.filters.push((row) =>
      clauses.some(({ column, term }) =>
        String(get(row, column) ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending ?? true });
    return this;
  }
  limit(count: number) {
    this.max = count;
    return this;
  }
  single() {
    this.mode = "single";
    return this;
  }
  maybeSingle() {
    this.mode = "maybeSingle";
    return this;
  }
  insert() {
    this.writes = true;
    return this;
  }
  update() {
    this.writes = true;
    return this;
  }
  upsert() {
    this.writes = true;
    return this;
  }
  delete() {
    this.writes = true;
    return this;
  }

  private run(): Result {
    if (this.writes) return refused;

    let rows = this.rows.filter((row) => this.filters.every((filter) => filter(row)));
    if (this.countOnly) return { data: null, error: null, count: rows.length };

    rows = rows.toSorted((a, b) => {
      for (const { column, ascending } of this.orders) {
        const order = compare(get(a, column), get(b, column));
        if (order !== 0) return ascending ? order : -order;
      }
      return 0;
    });
    if (this.max !== null) rows = rows.slice(0, this.max);

    if (this.mode === "many") return { data: rows, error: null, count: rows.length };
    if (rows.length === 0 && this.mode === "single") {
      return { data: null, error: { message: "Not found" }, count: 0 };
    }
    return { data: rows[0] ?? null, error: null, count: rows.length };
  }

  then<A = Result, B = never>(
    onFulfilled?: ((value: Result) => A | PromiseLike<A>) | null,
    onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null,
  ) {
    return Promise.resolve(this.run()).then(onFulfilled, onRejected);
  }
}

/** A fresh client per request, so sample order times follow the clock. */
export function createPreviewAdminClient() {
  const tables: Record<string, Row[]> = previewTables();
  return {
    from: (table: string) => new PreviewQuery(tables[table] ?? []),
    rpc: async () => refused,
    storage: {
      from: () => ({
        upload: async () => refused,
        remove: async () => refused,
      }),
    },
  };
}
