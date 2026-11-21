"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType } from "react";
import s from "./text-reveal.module.css";

/**
 * Word-by-word blur-in for headings, adapted from 21st.dev "Text Blur Reveal" (wensity)
 * without framer-motion: CSS keyframes, one IntersectionObserver, reduced-motion safe.
 * Words render visible on the server; the animation only starts once the heading is in view.
 */
export function TextReveal({ text, as: Tag = "h2", className, stagger = 70 }: { text: string; as?: ElementType; className?: string; stagger?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // already on screen at load: leave it still
    node.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      node.dataset.reveal = "run";
      observer.disconnect();
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const words = text.split(/\s+/).filter(Boolean);
  return <Tag ref={ref} className={`${s.reveal} ${className || ""}`}>
    {words.map((word, i) => <Fragment key={i}><span className={s.word} style={{ "--i": i, "--stagger": `${stagger}ms` } as CSSProperties}>{word}</span>{i < words.length - 1 ? " " : null}</Fragment>)}
  </Tag>;
}
