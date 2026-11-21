"use client";

import { useEffect, useRef } from "react";
import { useReveal, type RevealTarget } from "./use-reveal";

const reveals: readonly RevealTarget[] = [
  { selector: ".deal-bar", variant: "fade-in" },
  { selector: ".hero", variant: "zoom-in" },
  { selector: ".categories > .category", stagger: 90 },
  { selector: ".section-heading" },
  { selector: ".packages-grid > *, .guides-grid > *", stagger: 90 },
  { selector: ".testimonial-heading", variant: "slide-left" },
  { selector: ".testimonial-card", stagger: 90 },
  { selector: ".itinerary > .content" },
  { selector: ".about > h2, .about-copy", variant: "slide-left" },
  { selector: ".city-links", variant: "slide-right", stagger: 90 },
  // Homepage v2: each section enters a little differently so the page reads as a sequence.
  { selector: '[data-m="head"]' },
  { selector: '[data-m="track"] > *', stagger: 80 },
  { selector: '[data-m="tiles"] > *', variant: "wipe", stagger: 110 },
  { selector: '[data-m="track-alt"] > *', variant: "slide-right", stagger: 80 },
  { selector: '[data-m="why"] > *', variant: "zoom-in", stagger: 90 },
  { selector: '[data-m="rv-head"]', variant: "slide-left" },
  { selector: '[data-m="rv-card"]', variant: "slide-right" },
  { selector: '[data-m="airport"]' },
  { selector: '[data-m="about"]', stagger: 80 },
  { selector: '[data-m="chips"] > *', variant: "fade-in", stagger: 35 },
  { selector: ".site-footer .footer-main > *", stagger: 80 },
];

export default function HomepageMotion() {
  useReveal(reveals);
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const hero = document.querySelector<HTMLElement>('[aria-roledescription="carousel"]');
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const amount = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      progress.current?.style.setProperty("--scroll-progress", String(amount));
      // Hero depth: the photo drifts and grows while the copy lifts away as the banner leaves.
      if (hero && !still.matches) {
        const rect = hero.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
        hero.style.setProperty("--hero-p", p.toFixed(3));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return <div ref={progress} className="scroll-progress" aria-hidden="true" />;
}
