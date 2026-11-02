import { useEffect, useRef, useState } from "preact/hooks";
import type { Deck, Slide } from "../data/decks";

export function SlideView({
  slide,
  index,
  total,
  title,
}: {
  slide: Slide;
  index: number;
  total: number;
  title: string;
}) {
  return (
    <section class="slide-stage" aria-label={`Slide ${index + 1} of ${total}: ${slide.title}`}>
      <p class="eyebrow">{title}</p>
      <h2>{slide.title}</h2>
      {slide.body && <p>{slide.body}</p>}
      {slide.code && <pre class="slide-code">{slide.code}</pre>}
      {slide.bullets && (
        <ul>
          {slide.bullets.map((b) => (
            <li>{b}</li>
          ))}
        </ul>
      )}
      <span class="slide-number">
        {String(index + 1).padStart(2, "0")} / {total}
      </span>
    </section>
  );
}
export default function DeckPlayer({ deck }: { deck: Deck }) {
  const [index, setIndex] = useState(0),
    [notes, setNotes] = useState(false),
    [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sync = () => {
      const value = Number(location.hash.replace("#slide-", ""));
      if (Number.isInteger(value) && value >= 1 && value <= deck.slides.length) setIndex(value - 1);
    };
    sync();
    setReady(true);
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [deck.slides.length]);
  function go(value: number) {
    const next = Math.max(0, Math.min(deck.slides.length - 1, value));
    setIndex(next);
    history.replaceState(null, "", `#slide-${next + 1}`);
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (
        (e.target as HTMLElement)?.closest("input,select,textarea") ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      )
        return;
      if (e.key === " " && (e.target as HTMLElement)?.closest("button,a")) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(index + 1);
      }
      if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(index - 1);
      }
      if (e.key === "Home") {
        e.preventDefault();
        go(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        go(deck.slides.length - 1);
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [index, deck.slides.length]);
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.current?.requestFullscreen();
    } catch {
      setStatus(
        "Fullscreen is unavailable in this browser. You can still present with the slide controls.",
      );
    }
  }
  return (
    <div class="deck-root" ref={root} aria-busy={!ready}>
      <SlideView
        slide={deck.slides[index]}
        index={index}
        total={deck.slides.length}
        title={deck.title}
      />
      <div class="deck-toolbar">
        <span aria-live="polite">
          SLIDE {index + 1} / {deck.slides.length}
        </span>
        <button disabled={!ready || index === 0} onClick={() => go(index - 1)}>
          ← Previous
        </button>
        <button disabled={!ready || index === deck.slides.length - 1} onClick={() => go(index + 1)}>
          Next →
        </button>
        <button disabled={!ready} onClick={fullscreen}>
          Fullscreen
        </button>
        <button disabled={!ready} aria-pressed={notes} onClick={() => setNotes(!notes)}>
          Teacher notes
        </button>
        <button disabled={!ready} onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>
      <p class="small muted">
        Use ← / → or Space to present. Home / End jump to the first / last slide. Escape leaves
        fullscreen.
      </p>
      {notes && (
        <aside class="deck-notes">
          <p class="eyebrow">TEACHER NOTES</p>
          <p>{deck.slides[index].notes}</p>
        </aside>
      )}
      <p role="status" class="status">
        {status}
      </p>
      <div class="print-slides" aria-hidden="true">
        {deck.slides.map((slide, i) => (
          <SlideView slide={slide} index={i} total={deck.slides.length} title={deck.title} />
        ))}
      </div>
    </div>
  );
}
