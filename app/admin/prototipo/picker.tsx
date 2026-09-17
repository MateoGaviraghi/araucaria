"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Behavior contract of PICKER.md, expressed in React: 1–N and ←/→ switch, R replays, ?v= persists.
export function Picker({
  names,
  current,
  onSelect,
  onReplay,
}: {
  names: string[];
  current: number;
  onSelect: (index: number) => void;
  onReplay: () => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const move = () => {
      const item = itemRefs.current[current];
      const highlight = highlightRef.current;
      if (!item || !highlight) return;
      highlight.style.width = `${item.offsetWidth}px`;
      highlight.style.transform = `translateX(${item.offsetLeft}px)`;
    };
    move();
    window.addEventListener("resize", move);
    return () => window.removeEventListener("resize", move);
  }, [current]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(current + 1));
    window.history.replaceState(null, "", url);
  }, [current]);

  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const number = Number.parseInt(event.key, 10);
      if (number >= 1 && number <= names.length) onSelect(number - 1);
      else if (event.key === "ArrowRight") onSelect((current + 1) % names.length);
      else if (event.key === "ArrowLeft") onSelect((current - 1 + names.length) % names.length);
      else if (event.key === "r" || event.key === "R") onReplay();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, names.length, onSelect, onReplay]);

  return (
    <nav
      ref={navRef}
      className="proto-picker"
      aria-label="Prototype variants"
      data-position="top"
      data-ready={ready ? "" : undefined}
    >
      <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
      {names.map((name, index) => (
        <button
          key={name}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          type="button"
          className="proto-picker-item"
          data-active={index === current ? "" : undefined}
          aria-current={index === current ? "true" : undefined}
          onClick={() => onSelect(index)}
        >
          {name}
        </button>
      ))}
      <span className="proto-picker-divider" aria-hidden="true" />
      <button type="button" className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={onReplay}>
        ↻
      </button>
    </nav>
  );
}
