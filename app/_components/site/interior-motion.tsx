"use client";

import { useEffect, useRef } from "react";

// Animate only after the game reveals the site; content is never hidden by JS.
export function InteriorMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = marker.current?.closest(".aw-interior");
    const site = root?.closest(".aw-site");
    if (!root || !site || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target)) continue;
          observer.unobserve(entry.target);
          seen.add(entry.target);
          if (preference.matches) continue;
          const animation = entry.target.animate(
            [
              { opacity: 0, transform: "translateY(24px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 750, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
          );
          animations.add(animation);
          const forget = () => animations.delete(animation);
          animation.onfinish = forget;
          animation.oncancel = forget;
        }
      },
      { threshold: 0.12 },
    );

    const sync = () => {
      observer.disconnect();
      if (site.getAttribute("data-open") !== "true" || preference.matches) {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
        return;
      }
      root.querySelectorAll(".studio-reveal").forEach((element) => {
        if (!seen.has(element)) observer.observe(element);
      });
    };

    const arrival = new MutationObserver(sync);
    arrival.observe(site, { attributes: true, attributeFilter: ["data-open"] });
    preference.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      arrival.disconnect();
      preference.removeEventListener("change", sync);
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
  }, []);

  return <span ref={marker} hidden aria-hidden="true" />;
}
