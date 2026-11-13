import { beforeEach, describe, expect, it } from "vitest";
import {
  asRole,
  createProduct,
  createTestDatabase,
  createUser,
  stockOf,
  type TestDatabase,
} from "./harness";

const NAIRA = 100; // kobo per naira

type Order = {
  id: string;
  number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_reference: string;
  reserved_until: string | null;
  needs_review: boolean;
  review_reason: string | null;
  user_id: string | null;
};

type OrderInput = {
  items: { variant_id: string; quantity: number }[];
  email?: string;
  fulfillment?: "delivery" | "pickup";
  state?: string;
  pickupLocationId?: string | null;
  userId?: string | null;
};

function placeOrder(db: TestDatabase, input: OrderInput) {
  return asRole(db, "service_role", async () => {
    const { rows } = await db.query<Order>(
      `select * from public.create_order(
         p_email => $1,
         p_phone => '+2348000000000',
         p_full_name => 'Ada Obi',
         p_fulfillment => $2::public.fulfillment_method,
         p_items => $3::jsonb,
         p_address_line1 => '12 Aminu Kano Crescent',
         p_city => 'Abuja',
         p_state => $4,
         p_pickup_location_id => $5::uuid,
         p_user_id => $6::uuid
       )`,
      [
        input.email ?? "Ada@Example.com",
        input.fulfillment ?? "delivery",
        JSON.stringify(input.items),
        input.state ?? "FCT",
        input.pickupLocationId ?? null,
        input.userId ?? null,
      ],
    );
    return normalise(rows[0]);
  });
}

function confirmPayment(db: TestDatabase, reference: string, amount: number, currency = "NGN") {
  return asRole(db, "service_role", async () => {
    const { rows } = await db.query<{
      order_id: string;
      order_status: string;
      newly_paid: boolean;
      newly_flagged: boolean;
    }>(`select * from public.confirm_payment($1, $2, $3)`, [reference, amount, currency]);
    return rows[0];
  });
}

async function getOrder(db: TestDatabase, id: string) {
  const { rows } = await db.query<Order>(`select * from public.orders where id = $1`, [id]);
  return normalise(rows[0]);
}

async function expireReservation(db: TestDatabase, orderId: string) {
  await db.query(
    `update public.orders set reserved_until = now() - interval '1 minute' where id = $1`,
    [orderId],
  );
}

/** int8 columns come back as bigint; compare them as numbers. */
function normalise(order: Order): Order {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    delivery_fee: Number(order.delivery_fee),
    total: Number(order.total),
  };
}

let db: TestDatabase;

beforeEach(async () => {
  db = await createTestDatabase();
});

describe("create_order", () => {
  it("prices the order from the database and reserves stock", async () => {
    const tee = await createProduct(db, {
      slug: "radial-tee",
      price: 25_000 * NAIRA,
      stock: { M: 5 },
    });

    const order = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 2 }] });

    expect(order.number).toBe("RBN-1001");
    expect(order.status).toBe("pending_payment");
    expect(order.subtotal).toBe(50_000 * NAIRA);
    expect(order.delivery_fee).toBe(3_000 * NAIRA); // seeded Abuja (FCT) zone
    expect(order.total).toBe(53_000 * NAIRA);
    expect(order.reserved_until).not.toBeNull();
    expect(order.payment_reference).toMatch(/^rbn_[0-9a-f]{32}$/);
    expect(await stockOf(db, tee.variants.M)).toBe(3);

    const { rows: items } = await db.query<{
      size: string;
      quantity: number;
      product_name: string;
    }>(`select size, quantity, product_name from public.order_items where order_id = $1`, [
      order.id,
    ]);
    expect(items).toEqual([{ size: "M", quantity: 2, product_name: "Radial Tee" }]);
  });

  it("normalises the email address", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 1_000 * NAIRA, stock: { M: 1 } });
    const order = await placeOrder(db, {
      email: "  Ada@Example.COM ",
      items: [{ variant_id: tee.variants.M, quantity: 1 }],
    });
    const { rows } = await db.query<{ email: string }>(
      `select email from public.orders where id = $1`,
      [order.id],
    );
    expect(rows[0].email).toBe("ada@example.com");
  });

  it("merges repeated lines for the same variant", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { L: 4 } });

    const order = await placeOrder(db, {
      items: [
        { variant_id: tee.variants.L, quantity: 1 },
        { variant_id: tee.variants.L, quantity: 2 },
      ],
    });

    expect(order.subtotal).toBe(30_000 * NAIRA);
    expect(await stockOf(db, tee.variants.L)).toBe(1);
  });

  it("refuses to oversell and leaves stock untouched", async () => {
    const tee = await createProduct(db, {
      slug: "tee",
      price: 10_000 * NAIRA,
      stock: { S: 3, M: 1 },
    });

    await expect(
      placeOrder(db, {
        items: [
          { variant_id: tee.variants.S, quantity: 2 },
          { variant_id: tee.variants.M, quantity: 2 },
        ],
      }),
    ).rejects.toMatchObject({ message: "insufficient_stock", detail: tee.variants.M, hint: "1" });

    expect(await stockOf(db, tee.variants.S)).toBe(3);
    expect(await stockOf(db, tee.variants.M)).toBe(1);
  });

  it("refuses products that are not active", async () => {
    const draft = await createProduct(db, {
      slug: "draft-tee",
      price: 10_000 * NAIRA,
      stock: { M: 5 },
      status: "draft",
    });

    await expect(
      placeOrder(db, { items: [{ variant_id: draft.variants.M, quantity: 1 }] }),
    ).rejects.toMatchObject({ message: "product_unavailable", detail: draft.variants.M });
  });

  it("rejects quantities outside 1–10", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 50 } });

    await expect(
      placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 11 }] }),
    ).rejects.toMatchObject({ message: "invalid_quantity" });
    await expect(
      placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 0 }] }),
    ).rejects.toMatchObject({ message: "invalid_quantity" });
  });

  it("makes delivery free above the zone threshold", async () => {
    await db.query(`update public.delivery_zones set free_over = $1 where name = 'Abuja (FCT)'`, [
      100_000 * NAIRA,
    ]);
    const jacket = await createProduct(db, {
      slug: "jacket",
      price: 100_000 * NAIRA,
      stock: { M: 1 },
    });

    const order = await placeOrder(db, { items: [{ variant_id: jacket.variants.M, quantity: 1 }] });

    expect(order.delivery_fee).toBe(0);
    expect(order.total).toBe(100_000 * NAIRA);
  });

  it("refuses delivery to a state whose zone is inactive", async () => {
    await db.exec(`update public.delivery_zones set is_active = false where name = 'South West'`);
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 1 } });

    await expect(
      placeOrder(db, { state: "Lagos", items: [{ variant_id: tee.variants.M, quantity: 1 }] }),
    ).rejects.toMatchObject({ message: "delivery_unavailable", detail: "Lagos" });
    expect(await stockOf(db, tee.variants.M)).toBe(1);
  });

  it("supports free pickup from an active location only", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 2 } });
    const { rows } = await db.query<{ id: string }>(`select id from public.pickup_locations`);
    const pickupLocationId = rows[0].id;

    await expect(
      placeOrder(db, {
        fulfillment: "pickup",
        pickupLocationId,
        items: [{ variant_id: tee.variants.M, quantity: 1 }],
      }),
    ).rejects.toMatchObject({ message: "pickup_unavailable" });

    await db.query(`update public.pickup_locations set is_active = true where id = $1`, [
      pickupLocationId,
    ]);
    const order = await placeOrder(db, {
      fulfillment: "pickup",
      pickupLocationId,
      items: [{ variant_id: tee.variants.M, quantity: 1 }],
    });

    expect(order.delivery_fee).toBe(0);
    expect(order.total).toBe(10_000 * NAIRA);
  });

  it("cannot be called by visitors or signed-in customers", async () => {
    for (const role of ["anon", "authenticated"] as const) {
      await expect(
        asRole(db, role, () =>
          db.query(`select public.create_order('a@b.co', '1', 'A', 'delivery', '[]'::jsonb)`),
        ),
      ).rejects.toMatchObject({ message: expect.stringContaining("permission denied") });
    }
  });
});

describe("confirm_payment", () => {
  it("marks the order paid once, and is safe to repeat", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 20_000 * NAIRA, stock: { M: 2 } });
    const order = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });

    const first = await confirmPayment(db, order.payment_reference, order.total);
    const second = await confirmPayment(db, order.payment_reference, order.total);

    expect(first).toMatchObject({
      order_id: order.id,
      order_status: "paid",
      newly_paid: true,
      newly_flagged: false,
    });
    expect(second).toMatchObject({ order_status: "paid", newly_paid: false, newly_flagged: false });
    const paid = await getOrder(db, order.id);
    expect(paid.reserved_until).toBeNull();
    expect(await stockOf(db, tee.variants.M)).toBe(1);
  });

  it("does not mark an underpaid order as paid", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 20_000 * NAIRA, stock: { M: 1 } });
    const order = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });

    const result = await confirmPayment(db, order.payment_reference, 1 * NAIRA);
    // The redirect and the webhook both report it; the team is alerted once.
    const repeat = await confirmPayment(db, order.payment_reference, 1 * NAIRA);

    expect(result).toMatchObject({
      order_status: "pending_payment",
      newly_paid: false,
      newly_flagged: true,
    });
    expect(repeat.newly_flagged).toBe(false);
    const flagged = await getOrder(db, order.id);
    expect(flagged.needs_review).toBe(true);
    // People read this, so it's in naira, not kobo.
    expect(flagged.review_reason).toContain(
      `received 1.00 NGN, expected ${(order.total / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })} NGN`,
    );
  });

  it("rejects the wrong currency", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 20_000 * NAIRA, stock: { M: 1 } });
    const order = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });

    const result = await confirmPayment(db, order.payment_reference, order.total, "USD");

    expect(result.newly_paid).toBe(false);
  });

  it("re-reserves stock when payment lands after the reservation expired", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 20_000 * NAIRA, stock: { M: 1 } });
    const order = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });
    await expireReservation(db, order.id);
    await asRole(db, "service_role", () => db.query(`select public.release_expired_orders()`));
    expect(await stockOf(db, tee.variants.M)).toBe(1);

    const result = await confirmPayment(db, order.payment_reference, order.total);

    expect(result).toMatchObject({ order_status: "paid", newly_paid: true });
    expect(await stockOf(db, tee.variants.M)).toBe(0);
    expect((await getOrder(db, order.id)).needs_review).toBe(false);
  });

  it("flags a late payment for review when the stock has since sold", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 20_000 * NAIRA, stock: { M: 1 } });
    const late = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });
    await expireReservation(db, late.id);
    await asRole(db, "service_role", () => db.query(`select public.release_expired_orders()`));
    await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });

    const result = await confirmPayment(db, late.payment_reference, late.total);

    expect(result).toMatchObject({ order_status: "paid", newly_paid: true, newly_flagged: true });
    expect((await getOrder(db, late.id)).needs_review).toBe(true);
    expect(await stockOf(db, tee.variants.M)).toBe(0);
  });

  it("fails loudly for an unknown reference", async () => {
    await expect(confirmPayment(db, "rbn_unknown", 100)).rejects.toMatchObject({
      message: "order_not_found",
    });
  });
});

describe("release_expired_orders", () => {
  it("cancels only expired unpaid orders and restocks them", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 3 } });
    const expired = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });
    const fresh = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });
    await expireReservation(db, expired.id);

    const { rows } = await asRole(db, "service_role", () =>
      db.query<{ released: number }>(`select public.release_expired_orders() as released`),
    );

    expect(rows[0].released).toBe(1);
    expect((await getOrder(db, expired.id)).status).toBe("cancelled");
    expect((await getOrder(db, fresh.id)).status).toBe("pending_payment");
    expect(await stockOf(db, tee.variants.M)).toBe(2);
  });
});

describe("cancel_pending_order", () => {
  function cancel(reference: string) {
    return asRole(db, "service_role", async () => {
      const { rows } = await db.query<{ cancelled: boolean }>(
        `select public.cancel_pending_order($1, 'Customer cancelled payment.') as cancelled`,
        [reference],
      );
      return rows[0].cancelled;
    });
  }

  it("releases stock immediately, once", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 1 } });
    const order = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });

    expect(await cancel(order.payment_reference)).toBe(true);
    expect(await cancel(order.payment_reference)).toBe(false);
    expect((await getOrder(db, order.id)).status).toBe("cancelled");
    expect(await stockOf(db, tee.variants.M)).toBe(1);
  });

  it("never cancels a paid order", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 1 } });
    const order = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });
    await confirmPayment(db, order.payment_reference, order.total);

    expect(await cancel(order.payment_reference)).toBe(false);
    expect((await getOrder(db, order.id)).status).toBe("paid");
  });
});

describe("update_order_status", () => {
  async function paidOrder() {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 2 } });
    const order = await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });
    await confirmPayment(db, order.payment_reference, order.total);
    return { order, variantId: tee.variants.M };
  }

  async function makeAdmin(email: string) {
    const id = await createUser(db, email);
    await db.query(`update public.profiles set role = 'admin' where id = $1`, [id]);
    return id;
  }

  function setStatus(userId: string, orderId: string, status: string) {
    return asRole(
      db,
      "authenticated",
      () =>
        db.query(`select * from public.update_order_status($1, $2::public.order_status)`, [
          orderId,
          status,
        ]),
      userId,
    );
  }

  it("is admin-only", async () => {
    const { order } = await paidOrder();
    const customer = await createUser(db, "ada@example.com");

    await expect(setStatus(customer, order.id, "shipped")).rejects.toMatchObject({
      message: "forbidden",
    });
  });

  it("restocks when an undispatched order is cancelled", async () => {
    const { order, variantId } = await paidOrder();
    const admin = await makeAdmin("admin@rbn.test");

    await setStatus(admin, order.id, "cancelled");

    expect((await getOrder(db, order.id)).status).toBe("cancelled");
    expect(await stockOf(db, variantId)).toBe(2);
  });

  it("does not restock a refund after dispatch", async () => {
    const { order, variantId } = await paidOrder();
    const admin = await makeAdmin("admin@rbn.test");

    await setStatus(admin, order.id, "shipped");
    await setStatus(admin, order.id, "refunded");

    expect(await stockOf(db, variantId)).toBe(1);
  });

  it("rejects transitions that skip the flow", async () => {
    const { order } = await paidOrder();
    const admin = await makeAdmin("admin@rbn.test");

    await expect(setStatus(admin, order.id, "delivered")).rejects.toMatchObject({
      message: "invalid_transition",
      detail: "paid -> delivered",
    });
  });
});

describe("save_product", () => {
  async function adminId() {
    const id = await createUser(db, "admin@rbn.test");
    await db.query(`update public.profiles set role = 'admin' where id = $1`, [id]);
    return id;
  }

  async function categoryId() {
    const { rows } = await db.query<{ id: string }>(
      `select id from public.categories where slug = 'tees'`,
    );
    return rows[0].id;
  }

  function save(userId: string, id: string | null, product: object, variants: object[]) {
    return asRole(
      db,
      "authenticated",
      async () =>
        (
          await db.query<{ id: string }>(
            `select public.save_product($1::jsonb, $2::jsonb, $3) as id`,
            [JSON.stringify(product), JSON.stringify(variants), id],
          )
        ).rows[0].id,
      userId,
    );
  }

  async function sizes(productId: string) {
    const { rows } = await db.query<{ size: string; stock: number }>(
      `select size, stock from public.product_variants where product_id = $1 order by sort_order`,
      [productId],
    );
    return rows;
  }

  it("creates a product with its sizes and stamps the publish date when it goes live", async () => {
    const admin = await adminId();
    const product = {
      slug: "new-tee",
      name: "New Tee",
      category_id: await categoryId(),
      price: 2_000_000,
      status: "draft",
    };

    const id = await save(admin, null, product, [
      { size: "S", stock: 2 },
      { size: "M", stock: 3, sku: "NT-M" },
    ]);
    expect(await sizes(id)).toEqual([
      { size: "S", stock: 2 },
      { size: "M", stock: 3 },
    ]);
    const draft = await db.query<{ published_at: string | null }>(
      `select published_at from public.products where id = $1`,
      [id],
    );
    expect(draft.rows[0].published_at).toBeNull();

    await save(admin, id, { ...product, status: "active" }, [{ size: "S", stock: 2 }]);
    const live = await db.query<{ published_at: string | null }>(
      `select published_at from public.products where id = $1`,
      [id],
    );
    expect(live.rows[0].published_at).not.toBeNull();
  });

  it("updates kept sizes, adds new ones and removes the rest", async () => {
    const admin = await adminId();
    const tee = await createProduct(db, {
      slug: "tee",
      price: 1_000_000,
      stock: { S: 1, M: 1, L: 1 },
    });
    const product = {
      slug: "tee",
      name: "Tee",
      category_id: await categoryId(),
      price: 1_500_000,
      status: "active",
    };

    await save(admin, tee.productId, product, [
      { id: tee.variants.M, size: "M", stock: 9 },
      { size: "XL", stock: 4 },
    ]);

    expect(await sizes(tee.productId)).toEqual([
      { size: "M", stock: 9 },
      { size: "XL", stock: 4 },
    ]);
  });

  it("refuses to delete a size that has been ordered", async () => {
    const admin = await adminId();
    const tee = await createProduct(db, { slug: "tee", price: 1_000_000, stock: { S: 2, M: 2 } });
    await placeOrder(db, { items: [{ variant_id: tee.variants.S, quantity: 1 }] });
    const product = {
      slug: "tee",
      name: "Tee",
      category_id: await categoryId(),
      price: 1_000_000,
      status: "active",
    };

    await expect(
      save(admin, tee.productId, product, [{ id: tee.variants.M, size: "M", stock: 2 }]),
    ).rejects.toMatchObject({ code: "23001" }); // restrict_violation
    expect(await sizes(tee.productId)).toHaveLength(2);
  });

  it("is admin-only", async () => {
    const customer = await createUser(db, "ada@example.com");
    const product = { slug: "x", name: "X", category_id: await categoryId(), price: 100 };
    await expect(save(customer, null, product, [])).rejects.toMatchObject({ message: "forbidden" });
  });
});

describe("function permissions", () => {
  const CREATE_ORDER =
    "public.create_order(text, text, text, public.fulfillment_method, jsonb, text, text, text, text, text, uuid, uuid, integer)";

  async function canExecute(role: string, signature: string) {
    const { rows } = await db.query<{ allowed: boolean }>(
      `select has_function_privilege($1, $2, 'execute') as allowed`,
      [role, signature],
    );
    return rows[0].allowed;
  }

  it.each([
    [CREATE_ORDER, { anon: false, authenticated: false, service_role: true }],
    [
      "public.confirm_payment(text, bigint, text, timestamptz)",
      { anon: false, authenticated: false, service_role: true },
    ],
    ["public.release_expired_orders()", { anon: false, authenticated: false, service_role: true }],
    [
      "public.cancel_pending_order(text, text)",
      { anon: false, authenticated: false, service_role: true },
    ],
    ["public.claim_guest_orders()", { anon: false, authenticated: true }],
    [
      "public.update_order_status(uuid, public.order_status, text, text, text)",
      { anon: false, authenticated: true },
    ],
    ["public.save_product(jsonb, jsonb, uuid)", { anon: false, authenticated: true }],
    ["public.is_admin()", { anon: true, authenticated: true }],
    ["private.restock_order_items(uuid)", { anon: false, authenticated: false }],
    ["private.reserve_order_items(uuid)", { anon: false, authenticated: false }],
  ])("%s", async (signature, expected) => {
    for (const [role, allowed] of Object.entries(expected)) {
      expect({ role, allowed: await canExecute(role, signature) }).toEqual({ role, allowed });
    }
  });
});

describe("row level security", () => {
  it("shows visitors active products only", async () => {
    await createProduct(db, { slug: "live", price: 10_000 * NAIRA, stock: { M: 1 } });
    const draft = await createProduct(db, {
      slug: "secret",
      price: 10_000 * NAIRA,
      stock: { M: 1 },
      status: "draft",
    });

    const visible = await asRole(db, "anon", async () => ({
      products: (await db.query<{ slug: string }>(`select slug from public.products`)).rows,
      variants: (
        await db.query(`select id from public.product_variants where id = $1`, [draft.variants.M])
      ).rows,
    }));

    expect(visible.products).toEqual([{ slug: "live" }]);
    expect(visible.variants).toEqual([]);
  });

  it("hides every order from visitors and blocks direct writes", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 1 } });
    await placeOrder(db, { items: [{ variant_id: tee.variants.M, quantity: 1 }] });

    const { rows } = await asRole(db, "anon", () => db.query(`select id from public.orders`));
    expect(rows).toEqual([]);

    await expect(
      asRole(db, "anon", () => db.query(`update public.product_variants set stock = 999`)),
    ).resolves.toMatchObject({ affectedRows: 0 });
    await expect(
      asRole(db, "anon", () => db.query(`delete from public.orders`)),
    ).rejects.toMatchObject({ message: expect.stringContaining("permission denied") });
  });

  it("lets customers claim and read only their own guest orders", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 5 } });
    const mine = await placeOrder(db, {
      email: "ada@example.com",
      items: [{ variant_id: tee.variants.M, quantity: 1 }],
    });
    await placeOrder(db, {
      email: "bayo@example.com",
      items: [{ variant_id: tee.variants.M, quantity: 1 }],
    });
    const ada = await createUser(db, "Ada@Example.com");

    const claimed = await asRole(
      db,
      "authenticated",
      () => db.query<{ count: number }>(`select public.claim_guest_orders() as count`),
      ada,
    );
    const visible = await asRole(
      db,
      "authenticated",
      () => db.query<{ id: string }>(`select id from public.orders`),
      ada,
    );

    expect(claimed.rows[0].count).toBe(1);
    expect(visible.rows).toEqual([{ id: mine.id }]);
  });

  it("does not let an unverified email claim orders", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 1 } });
    await placeOrder(db, {
      email: "ada@example.com",
      items: [{ variant_id: tee.variants.M, quantity: 1 }],
    });
    const impostor = await createUser(db, "ada@example.com", false);

    const { rows } = await asRole(
      db,
      "authenticated",
      () => db.query<{ count: number }>(`select public.claim_guest_orders() as count`),
      impostor,
    );

    expect(rows[0].count).toBe(0);
  });

  it("hides internal notes from customers", async () => {
    const tee = await createProduct(db, { slug: "tee", price: 10_000 * NAIRA, stock: { M: 1 } });
    const ada = await createUser(db, "ada@example.com");
    const order = await placeOrder(db, {
      userId: ada,
      items: [{ variant_id: tee.variants.M, quantity: 1 }],
    });
    await confirmPayment(db, order.payment_reference, 1); // mismatch → internal note

    const { rows } = await asRole(
      db,
      "authenticated",
      () => db.query<{ is_internal: boolean }>(`select is_internal from public.order_events`),
      ada,
    );

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => !row.is_internal)).toBe(true);
  });

  it("lets customers edit their name and phone but not their role", async () => {
    const ada = await createUser(db, "ada@example.com");

    await asRole(
      db,
      "authenticated",
      () => db.query(`update public.profiles set full_name = 'Ada Obi' where id = $1`, [ada]),
      ada,
    );
    await expect(
      asRole(
        db,
        "authenticated",
        () => db.query(`update public.profiles set role = 'admin' where id = $1`, [ada]),
        ada,
      ),
    ).rejects.toMatchObject({ message: expect.stringContaining("permission denied") });

    const { rows } = await db.query<{ full_name: string; role: string }>(
      `select full_name, role from public.profiles where id = $1`,
      [ada],
    );
    expect(rows[0]).toEqual({ full_name: "Ada Obi", role: "customer" });
  });
});
