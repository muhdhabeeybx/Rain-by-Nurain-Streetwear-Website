"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type PointerEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/config/home-slides";
import { useMediaQuery, usePageHidden } from "@/lib/use-media";
import { cn } from "@/lib/utils";

/** How long each slide shows before advancing. */
const INTERVAL_MS = 6500;
/** Slides after the first load once the page has settled, keeping it fast to open. */
const PRIME_AFTER_MS = 1500;
const SWIPE_THRESHOLD_PX = 50;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Full-height home page slideshow. Advances on a timer shown by the progress
 * bars, and pauses for keyboard focus, hovering the text, a hidden tab, the
 * pause button, or a reduced-motion preference. Swipe on touch screens.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [primed, setPrimed] = useState(false);
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const pageHidden = usePageHidden();

  const count = slides.length;
  const autoplay = count > 1 && !reducedMotion && !userPaused;
  const running = autoplay && !hovering && !focusWithin && !pageHidden;

  useEffect(() => {
    const timer = setTimeout(() => setPrimed(true), PRIME_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") setSwipeStart(event.clientX);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart === null) return;
    const distance = event.clientX - swipeStart;
    setSwipeStart(null);
    if (Math.abs(distance) > SWIPE_THRESHOLD_PX) go(index + (distance < 0 ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setSwipeStart(null)}
      // Keyboard focus pauses the slideshow; a mouse click on a control doesn't.
      onFocus={(event) => {
        if (event.target.matches(":focus-visible")) setFocusWithin(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
      className="relative isolate h-[calc(100svh-6.25rem)] max-h-[60rem] min-h-[34rem] touch-pan-y overflow-hidden bg-ink text-paper lg:grid lg:min-h-[42rem] lg:grid-cols-12 lg:bg-paper lg:text-ink"
    >
      {/* Photos: behind the text on phones, the right-hand column on desktop. */}
      <div className="absolute inset-0 overflow-hidden lg:relative lg:order-2 lg:col-span-7">
        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index;
          const show = slideIndex === 0 || primed || active;
          return (
            <div
              key={slide.id}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-out",
                active ? "opacity-100" : "opacity-0",
              )}
            >
              {show && (
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  preload={slideIndex === 0}
                  placeholder="blur"
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className={cn("object-cover", active && !reducedMotion && "animate-kenburns")}
                  style={{ objectPosition: slide.position ?? "50% 50%" }}
                />
              )}
            </div>
          );
        })}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/5 lg:hidden"
        />
      </div>

      {/* Copy and controls */}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="relative z-10 flex h-full flex-col justify-end px-4 pb-6 md:px-6 md:pb-10 lg:col-span-5 lg:px-10 lg:pb-12"
      >
        <div className="grid" aria-live={running ? "off" : "polite"}>
          {slides.map((slide, slideIndex) => {
            const active = slideIndex === index;
            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} of ${count}`}
                aria-hidden={!active}
                inert={!active}
                className={cn(
                  "flex flex-col justify-end transition-opacity duration-500 [grid-area:1/1]",
                  active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                {/* Remounts on activation so the entrance animation replays. */}
                <div key={active ? "active" : "idle"}>
                  <p
                    className={cn(
                      "type-label text-paper/70 lg:text-muted",
                      active && "animate-rise",
                    )}
                  >
                    {slide.eyebrow}
                  </p>
                  <h2
                    className={cn(
                      "mt-4 type-display text-display-lg lg:mt-6 lg:text-[min(4.6vw,6.5rem)] lg:leading-[0.9]",
                      active && "animate-rise [--delay:90ms]",
                    )}
                  >
                    {slide.title}
                  </h2>
                  <p
                    className={cn(
                      "mt-5 hidden max-w-md text-paper/80 sm:block lg:mt-8 lg:text-muted",
                      active && "animate-rise [--delay:180ms]",
                    )}
                  >
                    {slide.body}
                  </p>
                  <div
                    className={cn(
                      "mt-6 flex flex-wrap gap-3 lg:mt-8",
                      active && "animate-rise [--delay:270ms]",
                    )}
                  >
                    <Button
                      asChild
                      size="lg"
                      className="bg-paper text-ink hover:bg-paper/85 lg:bg-ink lg:text-paper lg:hover:bg-ink/85"
                    >
                      <Link href={slide.primary.href}>
                        {slide.primary.label}
                        <ArrowRight className="transition-transform duration-300 group-hover/button:translate-x-1" />
                      </Link>
                    </Button>
                    {slide.secondary && (
                      <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="hidden border-paper text-paper hover:bg-paper hover:text-ink sm:inline-flex lg:border-ink lg:text-ink lg:hover:bg-ink lg:hover:text-paper"
                      >
                        <Link href={slide.secondary.href}>{slide.secondary.label}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <div className="mt-8 flex items-center gap-3 lg:mt-12">
            <span className="font-mono text-xs tabular-nums" aria-hidden>
              {pad(index + 1)} / {pad(count)}
            </span>
            <div className="flex flex-1 gap-2">
              {slides.map((slide, slideIndex) => {
                const active = slideIndex === index;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => go(slideIndex)}
                    aria-label={`Show slide ${slideIndex + 1}: ${slide.title}`}
                    aria-current={active ? "true" : undefined}
                    className="relative h-8 flex-1 cursor-pointer"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-current opacity-25"
                    />
                    <span
                      aria-hidden
                      key={active ? `active-${index}` : "idle"}
                      onAnimationEnd={active ? () => go(index + 1) : undefined}
                      className="absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-1/2 bg-current"
                      style={
                        active && autoplay
                          ? {
                              animation: `hero-progress ${INTERVAL_MS}ms linear both`,
                              animationPlayState: running ? "running" : "paused",
                            }
                          : { transform: `scaleX(${slideIndex <= index ? 1 : 0})` }
                      }
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex">
              <ControlButton label="Previous slide" onClick={() => go(index - 1)}>
                <ChevronLeft />
              </ControlButton>
              <ControlButton label="Next slide" onClick={() => go(index + 1)}>
                <ChevronRight />
              </ControlButton>
              {!reducedMotion && (
                <ControlButton
                  label={userPaused ? "Play slideshow" : "Pause slideshow"}
                  onClick={() => setUserPaused((paused) => !paused)}
                >
                  {userPaused ? <Play /> : <Pause />}
                </ControlButton>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-10 cursor-pointer place-items-center transition-colors hover:bg-paper/15 lg:hover:bg-mist [&_svg]:size-4 [&_svg]:stroke-[1.5]"
    >
      {children}
    </button>
  );
}
