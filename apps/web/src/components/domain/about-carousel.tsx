"use client";

import { aboutLangOption, type AboutLang } from "@ethio-wellness/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

type Card = { label: string; text: string };

export function AboutCarousel({
  about,
  aboutTranslated,
  aboutTranslatedLang,
}: {
  about: string;
  aboutTranslated?: string | null;
  aboutTranslatedLang?: AboutLang | null;
}) {
  const english = about.trim();
  const translated = aboutTranslated?.trim() ?? "";
  const second = translated && aboutTranslatedLang ? aboutLangOption(aboutTranslatedLang) : null;
  if (!english && !translated) {
    return <p className="mt-2 leading-7 text-ink-2">Nothing for now</p>;
  }
  const cards: Card[] = [];
  if (second && translated) cards.push({ label: second.chip, text: translated });
  if (english) cards.push({ label: "English", text: english });
  if (cards.length < 2) {
    return <BioCard card={cards[0]!} />;
  }
  return <Swipeable cards={cards} />;
}

function BioCard({ card }: { card: Card }) {
  return (
    <article className="mt-3 rounded-2xl border border-border bg-surface p-5">
      <p className="whitespace-pre-wrap leading-7 text-ink-2">{card.text}</p>
    </article>
  );
}

function Swipeable({ cards }: { cards: Card[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [hint, setHint] = useState(true);

  function go(next: number) {
    const root = scroller.current;
    const card = root?.children[next] as HTMLElement | undefined;
    if (!root || !card) return;
    root.scrollTo({ left: card.offsetLeft - root.offsetLeft, behavior: "smooth" });
    setIndex(next);
    setHint(false);
  }

  function onScroll() {
    const root = scroller.current;
    if (!root) return;
    const left = root.scrollLeft;
    const width = root.clientWidth || 1;
    const next = left > width * 0.45 ? 1 : 0;
    setIndex(next);
    if (left > 8) setHint(false);
  }

  return (
    <div className="mt-3">
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="About"
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(Math.min(cards.length - 1, index + 1));
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(Math.max(0, index - 1));
          }
        }}
      >
        {cards.map((card, cardIndex) => (
          <article
            key={card.label}
            className="w-[calc(100%-20px)] shrink-0 snap-start rounded-2xl border border-border bg-surface p-5"
            role="group"
            aria-roledescription="slide"
            aria-label={card.label}
          >
            <p className="whitespace-pre-wrap leading-7 text-ink-2">{card.text}</p>
            <span className="sr-only">
              Slide {cardIndex + 1} of {cards.length}
            </span>
          </article>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="tablist" aria-label="About languages">
          {cards.map((card, cardIndex) => (
            <button
              key={card.label}
              type="button"
              role="tab"
              aria-selected={index === cardIndex}
              aria-label={card.label}
              className={`size-2.5 rounded-full ${index === cardIndex ? "bg-primary" : "bg-border"}`}
              onClick={() => go(cardIndex)}
            />
          ))}
          {hint ? <span className="text-xs text-ink-3">Swipe</span> : null}
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border text-ink"
            aria-label="Previous bio"
            onClick={() => go(Math.max(0, index - 1))}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border text-ink"
            aria-label="Next bio"
            onClick={() => go(Math.min(cards.length - 1, index + 1))}
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
