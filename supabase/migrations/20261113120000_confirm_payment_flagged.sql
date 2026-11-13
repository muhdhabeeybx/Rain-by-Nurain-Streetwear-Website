-- =============================================================================
-- confirm_payment also reports when it has just flagged an order for review
-- (amount or currency mismatch, or a late payment for stock that has since
-- sold), so the app can alert the RBN team once instead of relying on someone
-- spotting it in the admin. Mismatch reasons now show amounts in naira rather
-- than kobo, since people read them. Same behaviour otherwise.
--
-- The return type changes, so the function is dropped and recreated.
-- =============================================================================

drop function public.confirm_payment(text, bigint, text, timestamptz);

create function public.confirm_payment(
  p_reference text,
  p_amount bigint,
  p_currency text,
  p_paid_at timestamptz default null
)
returns table (
  order_id uuid,
  order_number text,
  order_status public.order_status,
  newly_paid boolean,
  newly_flagged boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_reason text;
  v_flagged boolean := false;
begin
  select * into v_order
  from public.orders
  where payment_reference = p_reference
  for update;

  if not found then
    raise exception 'order_not_found' using detail = p_reference;
  end if;

  -- Already handled (paid, fulfilled, refunded): nothing to do.
  if v_order.status not in ('pending_payment', 'cancelled') then
    return query select v_order.id, v_order.number, v_order.status, false, false;
    return;
  end if;

  if p_amount is distinct from v_order.total or upper(p_currency) is distinct from v_order.currency then
    v_reason := format(
      'Payment amount mismatch: received %s %s, expected %s %s. Do not fulfil until resolved.',
      to_char(p_amount / 100.0, 'FM999,999,999,990.00'), upper(p_currency),
      to_char(v_order.total / 100.0, 'FM999,999,999,990.00'), v_order.currency
    );
    -- The redirect and the webhook both report the same charge; flag it once.
    if v_order.review_reason is distinct from v_reason then
      update public.orders
      set needs_review = true, review_reason = v_reason
      where id = v_order.id;

      insert into public.order_events (order_id, message, is_internal)
      values (v_order.id, v_reason, true);
      v_flagged := true;
    end if;

    return query select v_order.id, v_order.number, v_order.status, false, v_flagged;
    return;
  end if;

  -- The reservation expired (and stock was released) before payment landed.
  if v_order.status = 'cancelled' then
    if private.reserve_order_items(v_order.id) then
      insert into public.order_events (order_id, message, is_internal)
      values (v_order.id, 'Payment arrived after the reservation expired. Stock was reserved again.', true);
    else
      v_reason := 'Payment arrived after the reservation expired and some items are no longer in stock. Refund or restock before fulfilling.';
      update public.orders
      set needs_review = true, review_reason = v_reason
      where id = v_order.id;

      insert into public.order_events (order_id, message, is_internal)
      values (v_order.id, v_reason, true);
      v_flagged := true;
    end if;
  end if;

  update public.orders
  set status = 'paid', paid_at = coalesce(p_paid_at, now()), reserved_until = null
  where id = v_order.id
  returning * into v_order;

  insert into public.order_events (order_id, status, message)
  values (v_order.id, 'paid', 'Payment confirmed.');

  return query select v_order.id, v_order.number, v_order.status, true, v_flagged;
end;
$$;

revoke execute on function public.confirm_payment(text, bigint, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.confirm_payment(text, bigint, text, timestamptz) to service_role;
