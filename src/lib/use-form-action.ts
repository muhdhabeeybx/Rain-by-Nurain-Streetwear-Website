"use client";

import { type FormEvent, useActionState, useTransition } from "react";

/**
 * useActionState for forms that must keep what the person typed when the
 * server returns an error. `<form action={…}>` resets uncontrolled fields after
 * every submission; dispatching from onSubmit does not.
 */
export function useFormAction<State>(
  action: (state: Awaited<State>, formData: FormData) => State | Promise<State>,
  initialState: Awaited<State>,
) {
  const [state, dispatch, isPending] = useActionState(action, initialState);
  const [isSubmitting, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  return [state, onSubmit, isPending || isSubmitting] as const;
}
