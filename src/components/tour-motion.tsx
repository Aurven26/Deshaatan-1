"use client";

import { useEffect, useRef } from "react";
import { useReveal, type RevealTarget } from "./use-reveal";

// Each part of the trip page enters differently, so the page reads as a sequence.
const reveals: readonly RevealTarget[] = [
  { selector: '[data-m="photo-main"]', variant: "zoom-in" },
  { selector: '[data-m="photo-side"]', variant: "slide-right" },
  { selector: '[data-m="form"]', variant: "slide-left" },
  { selector: '[data-m="section-head"]' },
  { selector: '[data-m="highlights"] > li', stagger: 50 },
  { selector: '[data-m="days"] > *', variant: "slide-left", stagger: 60 },
  { selector: '[data-m="end-trip"]', variant: "wipe" },
  { selector: '[data-m="checklist"] > li', variant: "fade-in", stagger: 40 },
  { selector: '[data-m="faq"] > details', stagger: 50 },
  { selector: '[data-m="review-summary"]', variant: "zoom-in" },
  { selector: '[data-m="review-cards"] > *', variant: "slide-right", stagger: 80 },
  { selector: '[data-m="policies"] > details', variant: "fade-in", stagger: 50 },
  { selector: '[data-m="related"] > *', stagger: 80 },
];

/**
 * Reading progress for the whole page plus a route line through the itinerary that fills
 * as the days are read. Ported from 21st.dev "Scroll Progress" (cnippet-dev): the spring is a
 * small requestAnimationFrame ease instead of the motion library.
 */
export default function TourMotion() {
  useReveal(reveals);
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, page = 0, route = 0, pageTarget = 0, routeTarget = 0;
    const measure = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      pageTarget = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      const days = document.querySelector<HTMLElement>('[data-m="days"]');
      if (days) {
        const rect = days.getBoundingClientRect();
        const reading = window.innerHeight * 0.6;
        routeTarget = Math.min(1, Math.max(0, (reading - rect.top) / Math.max(1, rect.height)));
        const line = rect.top + routeTarget * rect.height;
        days.querySelectorAll<HTMLElement>(':scope > *').forEach(day => {
          const top = day.getBoundingClientRect().top + 28;
          day.dataset.passed = String(top <= line + 1);
        });
      }
    };
    const tick = () => {
      frame = 0;
      measure();
      const ease = still.matches ? 1 : 0.18;
      page += (pageTarget - page) * ease;
      route += (routeTarget - route) * ease;
      bar.current?.style.setProperty("--scroll-progress", page.toFixed(4));
      document.querySelector<HTMLElement>('[data-m="days"]')?.style.setProperty("--route", route.toFixed(4));
      if (Math.abs(pageTarget - page) > 0.001 || Math.abs(routeTarget - route) > 0.001) frame = requestAnimationFrame(tick);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);
  return <div ref={bar} className="scroll-progress" aria-hidden="true" />;
}
