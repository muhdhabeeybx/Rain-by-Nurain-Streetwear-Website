"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const WIDTHS = { Desktop: 680, Phone: 390 } as const;

/** Shows an email in an isolated frame, at desktop or phone width. */
export function EmailFrame({ html, title }: { html: string; title: string }) {
  const [width, setWidth] = useState<keyof typeof WIDTHS>("Desktop");
  const [height, setHeight] = useState(1200);

  return (
    <div className="mt-6">
      <div role="group" aria-label="Preview width" className="mb-4 flex gap-1">
        {(Object.keys(WIDTHS) as (keyof typeof WIDTHS)[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={width === option}
            onClick={() => setWidth(option)}
            className={cn(
              "h-9 px-3 type-label",
              width === option ? "bg-ink text-paper" : "border border-line hover:bg-mist",
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto border border-line bg-mist p-4">
        <iframe
          key={`${width}-${title}`}
          title={title}
          // Links open in a new tab; the email can't run scripts.
          srcDoc={html.replace("<head>", '<head><base target="_blank">')}
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          onLoad={(event) => {
            const body = event.currentTarget.contentDocument?.body;
            if (body) setHeight(body.scrollHeight);
          }}
          style={{ width: WIDTHS[width], height }}
          className="mx-auto block max-w-none bg-paper"
        />
      </div>
    </div>
  );
}
