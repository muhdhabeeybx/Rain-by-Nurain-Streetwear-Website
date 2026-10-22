"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/** A submit button that asks for confirmation first. */
export function ConfirmButton({
  confirmation,
  ...props
}: ComponentProps<typeof Button> & { confirmation: string }) {
  return (
    <Button
      type="submit"
      {...props}
      onClick={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault();
      }}
    />
  );
}
