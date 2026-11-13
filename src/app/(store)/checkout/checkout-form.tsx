"use client";

import Link from "next/link";
import { type FormEvent, useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { ProductImage } from "@/components/store/product-image";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { type CartLine, countItems } from "@/lib/cart/lines";
import { PENDING_ORDER_KEY, useCart, useCartHydrated } from "@/lib/cart/store";
import { deliveryEstimate, deliveryFeeFor, zoneForState } from "@/lib/checkout/fees";
import type { DeliveryOptions } from "@/lib/delivery";
import { formatNaira } from "@/lib/money";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { cn } from "@/lib/utils";
import { type PlaceOrderState, placeOrder, type QuoteLine, quoteCart } from "./actions";

export type CheckoutDefaults = { email: string; fullName: string; phone: string };

type CheckoutFormProps = {
  options: DeliveryOptions;
  defaults: CheckoutDefaults;
  notice: string | null;
};

type LineIssue = { kind: "unavailable" } | { kind: "limited"; available: number };

export function CheckoutForm({ options, defaults, notice }: CheckoutFormProps) {
  const hydrated = useCartHydrated();
  const lines = useCart((state) => state.lines);
  const refreshCart = useCart((state) => state.refresh);
  const setQuantity = useCart((state) => state.setQuantity);
  const removeLine = useCart((state) => state.remove);

  const [quote, setQuote] = useState<QuoteLine[] | null>(null);
  const [quoteError, setQuoteError] = useState(false);
  const [state, dispatch] = useActionState<PlaceOrderState, FormData>(placeOrder, {
    status: "idle",
  });
  const [isSubmitting, startSubmit] = useTransition();
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [selectedState, setSelectedState] = useState("");

  // Re-price whenever the set of variants changes, or after a stock error.
  const variantKey = lines.map((line) => line.variantId).join(",");
  const stockError = state.status === "error" && state.stockChanged ? state : null;
  useEffect(() => {
    if (!hydrated) return;
    const ids = variantKey ? variantKey.split(",") : [];
    let cancelled = false;
    quoteCart(ids)
      .then((live) => {
        if (cancelled) return;
        setQuote(live);
        setQuoteError(false);
        refreshCart(live);
      })
      .catch(() => !cancelled && setQuoteError(true));
    return () => {
      cancelled = true;
    };
  }, [hydrated, variantKey, stockError, refreshCart]);

  useEffect(() => {
    if (state.status === "redirect") {
      sessionStorage.setItem(PENDING_ORDER_KEY, state.orderNumber);
      window.location.assign(state.url);
    }
  }, [state]);

  const issues = useMemo(() => {
    const found = new Map<string, LineIssue>();
    if (!quote) return found;
    for (const line of lines) {
      const live = quote.find((item) => item.variantId === line.variantId);
      if (!live || live.available <= 0) found.set(line.variantId, { kind: "unavailable" });
      else if (live.available < line.quantity) {
        found.set(line.variantId, { kind: "limited", available: live.available });
      }
    }
    return found;
  }, [lines, quote]);

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const zone = selectedState ? zoneForState(options.zones, selectedState) : null;
  const deliveryFee = fulfillment === "pickup" ? 0 : zone ? deliveryFeeFor(zone, subtotal) : null;
  const total = subtotal + (deliveryFee ?? 0);
  // Errors from the last submission, minus fields the customer has edited since.
  const [edited, setEdited] = useState({ for: state, fields: new Set<string>() });
  const editedFields = edited.for === state ? edited.fields : new Set<string>();
  const submittedErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const fieldErrors = Object.fromEntries(
    Object.entries(submittedErrors).filter(([field]) => !editedFields.has(field)),
  ) as typeof submittedErrors;
  const hasSubmittedFieldErrors = Object.keys(submittedErrors).length > 0;
  const markEdited = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name;
    if (name && name in submittedErrors && !editedFields.has(name)) {
      setEdited({ for: state, fields: new Set(editedFields).add(name) });
    }
  };
  const isRedirecting = state.status === "redirect";
  const busy = isSubmitting || isRedirecting;

  const fixBag = () => {
    for (const [variantId, issue] of issues) {
      if (issue.kind === "unavailable") removeLine(variantId);
      else setQuantity(variantId, issue.available);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set(
      "items",
      JSON.stringify(lines.map(({ variantId, quantity }) => ({ variantId, quantity }))),
    );
    // Dispatching manually (not via <form action>) keeps the fields filled in
    // if the server sends back an error.
    startSubmit(() => dispatch(formData));
  };

  if (!hydrated) return <CheckoutSkeleton />;

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="type-display text-display-sm">Your bag is empty</p>
        <p className="mt-3 text-muted">Add a few pieces, then come back to check out.</p>
        <Button asChild className="mt-8">
          <Link href="/shop">Shop the collection</Link>
        </Button>
      </div>
    );
  }

  const summary = (
    <OrderSummary
      lines={lines}
      issues={issues}
      subtotal={subtotal}
      deliveryFee={deliveryFee}
      fulfillment={fulfillment}
      total={total}
      onFix={issues.size > 0 ? fixBag : undefined}
    />
  );

  return (
    <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-16">
      <details className="group mb-8 border-y border-line lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4">
          <span className="type-label">
            <span className="group-open:hidden">Show</span>
            <span className="hidden group-open:inline">Hide</span> order summary (
            {countItems(lines)})
          </span>
          <span className="tabular-nums">{formatNaira(total)}</span>
        </summary>
        <div className="pb-6">{summary}</div>
      </details>

      <form
        onSubmit={submit}
        onInput={markEdited}
        onChange={markEdited}
        noValidate
        className="space-y-12 lg:col-span-7"
      >
        {notice && (
          <p role="status" className="border border-ink bg-mist p-4 text-sm">
            {notice}
          </p>
        )}

        <fieldset className="space-y-5">
          <legend className="mb-6 type-display text-display-sm">Contact</legend>
          <Field
            label="Email"
            htmlFor="email"
            error={fieldErrors.email}
            hint="Your receipt and order updates go here."
          >
            <Input
              {...describedBy("email", fieldErrors.email, true)}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaults.email}
              required
            />
          </Field>
          <Field
            label="Phone"
            htmlFor="phone"
            error={fieldErrors.phone}
            hint="For the delivery rider."
          >
            <Input
              {...describedBy("phone", fieldErrors.phone, true)}
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="0803 123 4567"
              defaultValue={defaults.phone}
              required
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-6 type-display text-display-sm">Delivery</legend>
          {options.pickupLocations.length > 0 && (
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Delivery method">
              {(["delivery", "pickup"] as const).map((method) => (
                <label
                  key={method}
                  className={cn(
                    "flex h-12 cursor-pointer items-center justify-center border type-label transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                    fulfillment === method
                      ? "border-ink bg-ink text-paper"
                      : "border-line-strong hover:border-ink",
                  )}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    value={method}
                    checked={fulfillment === method}
                    onChange={() => setFulfillment(method)}
                    className="sr-only"
                  />
                  {method === "delivery" ? "Deliver to me" : "Pick up"}
                </label>
              ))}
            </div>
          )}
          {options.pickupLocations.length === 0 && (
            <input type="hidden" name="fulfillment" value="delivery" />
          )}

          <Field label="Full name" htmlFor="fullName" error={fieldErrors.fullName}>
            <Input
              {...describedBy("fullName", fieldErrors.fullName)}
              name="fullName"
              autoComplete="name"
              defaultValue={defaults.fullName}
              required
            />
          </Field>

          {fulfillment === "delivery" ? (
            <>
              <Field label="Street address" htmlFor="addressLine1" error={fieldErrors.addressLine1}>
                <Input
                  {...describedBy("addressLine1", fieldErrors.addressLine1)}
                  name="addressLine1"
                  autoComplete="address-line1"
                  required
                />
              </Field>
              <Field
                label="Apartment, estate, landmark (optional)"
                htmlFor="addressLine2"
                error={fieldErrors.addressLine2}
              >
                <Input
                  {...describedBy("addressLine2", fieldErrors.addressLine2)}
                  name="addressLine2"
                  autoComplete="address-line2"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="City or town" htmlFor="city" error={fieldErrors.city}>
                  <Input
                    {...describedBy("city", fieldErrors.city)}
                    name="city"
                    autoComplete="address-level2"
                    required
                  />
                </Field>
                <Field
                  label="State"
                  htmlFor="state"
                  error={fieldErrors.state}
                  hint={zone ? `${zone.name}: ${deliveryEstimate(zone)}` : undefined}
                >
                  <Select
                    {...describedBy("state", fieldErrors.state, Boolean(zone))}
                    name="state"
                    autoComplete="address-level1"
                    value={selectedState}
                    onChange={(event) => setSelectedState(event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Choose a state
                    </option>
                    {NIGERIAN_STATES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field
                label="Delivery note (optional)"
                htmlFor="deliveryNote"
                error={fieldErrors.deliveryNote}
              >
                <Textarea
                  {...describedBy("deliveryNote", fieldErrors.deliveryNote)}
                  name="deliveryNote"
                  rows={3}
                  placeholder="Gate code, best time to call…"
                />
              </Field>
            </>
          ) : (
            <PickupChoice options={options} error={fieldErrors.pickupLocationId} />
          )}
        </fieldset>

        <div className="space-y-4 border-t border-line pt-8">
          {state.status === "error" &&
            (!hasSubmittedFieldErrors || Object.keys(fieldErrors).length > 0) && (
              <p role="alert" className="text-sm text-signal">
                {state.message}
              </p>
            )}
          {quoteError && (
            <p role="alert" className="text-sm text-signal">
              We couldn&apos;t check the latest prices. Check your connection and refresh the page.
            </p>
          )}
          {issues.size > 0 && (
            <p role="alert" className="text-sm text-signal">
              Some pieces in your bag have changed. Review your order summary before paying.
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={busy || !quote || issues.size > 0}
          >
            {isRedirecting
              ? "Taking you to Paystack…"
              : isSubmitting
                ? "Reserving your pieces…"
                : deliveryFee === null
                  ? "Continue to payment"
                  : `Pay ${formatNaira(total)}`}
          </Button>
          <p className="text-center text-sm text-muted">
            You&apos;ll pay securely on Paystack by card, bank transfer or USSD. Your pieces are
            held for 30 minutes while you pay.
          </p>
        </div>
      </form>

      <aside className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-24 border border-line p-6">
          <h2 className="mb-6 type-label">Order summary ({countItems(lines)})</h2>
          {summary}
        </div>
      </aside>
    </div>
  );
}

function PickupChoice({ options, error }: { options: DeliveryOptions; error?: string }) {
  const [location] = options.pickupLocations;
  if (options.pickupLocations.length === 1) {
    return (
      <div className="border border-line p-5 text-sm">
        <input type="hidden" name="pickupLocationId" value={location.id} />
        <p className="font-medium">{location.name}</p>
        <p className="mt-1 text-muted">
          {location.address}, {location.city}
        </p>
        {location.hours && <p className="mt-1 text-muted">{location.hours}</p>}
        {location.instructions && <p className="mt-3">{location.instructions}</p>}
        <p className="mt-4 type-label">Free · We&apos;ll email you when it&apos;s ready</p>
      </div>
    );
  }

  return (
    <Field label="Pickup location" htmlFor="pickupLocationId" error={error}>
      <Select
        {...describedBy("pickupLocationId", error)}
        name="pickupLocationId"
        defaultValue=""
        required
      >
        <option value="" disabled>
          Choose a location
        </option>
        {options.pickupLocations.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}, {option.city}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function OrderSummary({
  lines,
  issues,
  subtotal,
  deliveryFee,
  fulfillment,
  total,
  onFix,
}: {
  lines: CartLine[];
  issues: Map<string, LineIssue>;
  subtotal: number;
  deliveryFee: number | null;
  fulfillment: "delivery" | "pickup";
  total: number;
  onFix?: () => void;
}) {
  return (
    <div>
      <ul className="divide-y divide-line">
        {lines.map((line) => {
          const issue = issues.get(line.variantId);
          return (
            <li key={line.variantId} className="flex gap-4 py-4 first:pt-0">
              <div className="relative aspect-4/5 w-16 shrink-0 overflow-hidden bg-mist">
                <ProductImage path={line.imagePath} alt={line.name} sizes="64px" />
                <span className="absolute top-1 right-1 grid h-5 min-w-5 place-items-center bg-ink px-1 text-[0.625rem] text-paper tabular-nums">
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{line.name}</p>
                <p className="text-sm text-muted">
                  {[line.colorName, `Size ${line.size}`].filter(Boolean).join(" · ")}
                </p>
                {issue && (
                  <p className="mt-1 text-sm text-signal">
                    {issue.kind === "unavailable" ? "Sold out" : `Only ${issue.available} left`}
                  </p>
                )}
              </div>
              <p className="text-sm tabular-nums">{formatNaira(line.price * line.quantity)}</p>
            </li>
          );
        })}
      </ul>
      {onFix && (
        <Button type="button" variant="secondary" size="sm" className="mt-2 w-full" onClick={onFix}>
          Update my bag
        </Button>
      )}
      <dl className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums">{formatNaira(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">{fulfillment === "pickup" ? "Pickup" : "Delivery"}</dt>
          <dd className="tabular-nums">
            {deliveryFee === null
              ? "Choose a state"
              : deliveryFee === 0
                ? "Free"
                : formatNaira(deliveryFee)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatNaira(total)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div aria-hidden className="mt-8 lg:grid lg:grid-cols-12 lg:gap-16">
      <div className="space-y-5 lg:col-span-7">
        <div className="h-8 w-40 animate-pulse bg-mist" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-12 animate-pulse bg-mist" />
        ))}
      </div>
      <div className="hidden h-96 animate-pulse bg-mist lg:col-span-5 lg:block" />
    </div>
  );
}
