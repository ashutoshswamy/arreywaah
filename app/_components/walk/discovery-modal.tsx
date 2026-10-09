"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { DISCOVERIES, type DiscoveryId } from "./gameplay";

type DiscoveryModalProps = {
  discoveryId: DiscoveryId;
  closing: boolean;
  onClose: () => void;
  onExited: () => void;
};

export function DiscoveryModal({
  discoveryId,
  closing,
  onClose,
  onExited,
}: DiscoveryModalProps) {
  const dialog = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const discovery = DISCOVERIES.find((item) => item.id === discoveryId)!;

  useEffect(() => {
    closeButton.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let tween: { kill: () => void } | undefined;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      if (closing) onExited();
      return;
    }
    import("gsap")
      .then(({ gsap }) => {
        if (cancelled) return;
        const element = dialog.current;
        if (!element) return;
        if (closing) {
          tween = gsap.to(element, {
            autoAlpha: 0,
            y: 18,
            rotation: 1.2,
            scale: 0.97,
            duration: 0.24,
            ease: "power2.in",
            onComplete: onExited,
          });
        } else {
          tween = gsap.fromTo(
            element,
            { autoAlpha: 0, y: 24, rotation: -1.4, scale: 0.96 },
            {
              autoAlpha: 1,
              y: 0,
              rotation: 0,
              scale: 1,
              duration: 0.52,
              ease: "power3.out",
            },
          );
        }
      })
      .catch(() => {
        if (closing && !cancelled) onExited();
      });
    return () => {
      cancelled = true;
      tween?.kill();
    };
  }, [closing, onExited]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = dialog.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), a[href], [tabindex='0']",
    );
    if (!focusable?.length) return;
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="aw-discovery-backdrop">
      <section
        ref={dialog}
        className="aw-paper-note"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aw-discovery-title"
        aria-describedby="aw-discovery-message"
        onKeyDown={handleKeyDown}
      >
        <div className="aw-paper-meta">
          <span>Neighbourhood note</span>
          <span aria-hidden="true">✳</span>
        </div>
        <p className="aw-paper-kicker">Found along the way</p>
        <h2 id="aw-discovery-title">{discovery.name}</h2>
        <p id="aw-discovery-message" className="aw-paper-message">
          {discovery.message}
        </p>
        <div className="aw-paper-footer">
          <span>Arrey Waah · Mumbai</span>
          <button
            ref={closeButton}
            type="button"
            className="aw-btn aw-paper-continue"
            onClick={onClose}
          >
            Keep walking
          </button>
        </div>
      </section>
    </div>
  );
}
