"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from "react";
import {
  DISCOVERIES,
  type GameSnapshot,
  type JourneyController,
} from "./gameplay";

type Phase = "walk" | "enter" | "reveal" | "done";
type Status = "loading" | "ready" | "error";
type Drag = {
  id: number;
  x: number;
  y: number;
  moved: boolean;
  dx: number;
  dy: number;
};

const INITIAL_SNAPSHOT: GameSnapshot = {
  discovered: [],
  nearby: null,
  prompt: "Explore the neighbourhood",
  message: "Five little discoveries. One creative office. Take a detour?",
  automatic: false,
};
const DIRECTIONS = [
  { label: "↑", name: "Walk up", x: 0, y: -1, className: "aw-pad-up" },
  { label: "←", name: "Walk left", x: -1, y: 0, className: "aw-pad-left" },
  { label: "↓", name: "Walk down", x: 0, y: 1, className: "aw-pad-down" },
  { label: "→", name: "Walk right", x: 1, y: 0, className: "aw-pad-right" },
] as const;
const MOVEMENT_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowleft",
  "arrowdown",
  "arrowright",
]);

function isEditing(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      Boolean(
        target.closest(
          "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
        ),
      ))
  );
}

export function Experience({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("walk");
  const [status, setStatus] = useState<Status>("loading");
  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL_SNAPSHOT);
  const [running, setRunning] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("walk");
  const controller = useRef<JourneyController | null>(null);
  const disposeJourney = useRef<(() => void) | null>(null);
  const timers = useRef<number[]>([]);
  const drag = useRef<Drag | null>(null);
  const keys = useRef(new Set<string>());
  const pad = useRef(new Map<number, { x: number; y: number }>());
  const runRef = useRef(false);
  const origin = useRef<{ x: number; z: number } | null>(null);

  const updateMovement = useCallback(() => {
    if (phaseRef.current !== "walk") return;
    const held = keys.current;
    let x =
      Number(held.has("d") || held.has("arrowright")) -
      Number(held.has("a") || held.has("arrowleft"));
    let y =
      Number(held.has("s") || held.has("arrowdown")) -
      Number(held.has("w") || held.has("arrowup"));
    for (const direction of pad.current.values()) {
      x += direction.x;
      y += direction.y;
    }
    if (drag.current?.moved) {
      x = drag.current.dx / 60;
      y = drag.current.dy / 60;
    }
    const length = Math.max(1, Math.hypot(x, y));
    controller.current?.move(
      x / length,
      y / length,
      held.has("shift") || runRef.current,
    );
  }, []);

  const stopInput = useCallback(() => {
    keys.current.clear();
    pad.current.clear();
    drag.current = null;
    controller.current?.move(0, 0);
  }, []);

  const cancelAuto = useCallback(() => controller.current?.autoWalk(false), []);

  const finish = useCallback(() => {
    phaseRef.current = "done";
    disposeJourney.current?.();
    setPhase("done");
  }, []);

  const skip = useCallback(() => {
    if (phaseRef.current === "done" || phaseRef.current === "reveal") return;
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    stopInput();
    controller.current?.autoWalk(false);
    phaseRef.current = "reveal";
    setPhase("reveal");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    timers.current.push(window.setTimeout(finish, reduce ? 0 : 350));
  }, [finish, stopInput]);

  useEffect(() => {
    if (window.location.hash.length > 1) {
      skip();
      return;
    }
    const container = host.current;
    if (!container || phaseRef.current !== "walk") return;
    let cancelled = false;
    let failed = false;
    let disposed = false;
    let localController: JourneyController | null = null;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      localController?.dispose();
      if (controller.current === localController) controller.current = null;
    };
    const fail = () => {
      failed = true;
      timers.current.push(
        window.setTimeout(() => {
          if (cancelled || phaseRef.current !== "walk") return;
          stopInput();
          dispose();
          setStatus("error");
        }, 0),
      );
    };

    // Keep WebGL deferred while the server-rendered site remains in the document.
    Promise.all([import("./journey"), document.fonts.ready])
      .then(([{ createJourney }]) => {
        if (cancelled || phaseRef.current !== "walk") return;
        origin.current = null;
        localController = createJourney(container, {
          onSnapshot(next) {
            if (!cancelled && !failed && phaseRef.current === "walk")
              setSnapshot(next);
          },
          onPosition(x, z) {
            if (cancelled || phaseRef.current !== "walk") return;
            if (!origin.current) origin.current = { x, z };
            if (
              stage.current &&
              stage.current.dataset.moved !== "true" &&
              Math.hypot(x - origin.current.x, z - origin.current.z) > 0.2
            ) {
              stage.current.dataset.moved = "true";
            }
          },
          onArrive() {
            timers.current.push(
              window.setTimeout(() => {
                if (cancelled || phaseRef.current !== "walk") return;
                stopInput();
                phaseRef.current = "enter";
                setPhase("enter");
                const reduce = window.matchMedia(
                  "(prefers-reduced-motion: reduce)",
                ).matches;
                timers.current.push(window.setTimeout(skip, reduce ? 0 : 450));
              }, 0),
            );
          },
          onError: fail,
        });
        controller.current = localController;
        disposeJourney.current = dispose;
        if (!failed) setStatus("ready");
      })
      .catch(fail);

    return () => {
      cancelled = true;
      dispose();
      if (disposeJourney.current === dispose) disposeJourney.current = null;
    };
  }, [attempt, skip, stopInput]);

  useEffect(() => {
    if (phase === "done") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    let hash = window.location.hash.slice(1);
    try {
      hash = decodeURIComponent(hash);
    } catch {
      /* Preserve malformed anchors as literal IDs. */
    }
    const target = document.getElementById(hash);
    if (target) target.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
    const main =
      document.getElementById("main") ?? document.querySelector("main");
    if (main) {
      const previous = main.getAttribute("tabindex");
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
      if (previous === null) main.removeAttribute("tabindex");
      else main.setAttribute("tabindex", previous);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "walk") return;
    const down = (event: KeyboardEvent) => {
      if (
        phaseRef.current !== "walk" ||
        isEditing(event.target) ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      const key = event.key.toLowerCase();
      if (key === "escape") {
        event.preventDefault();
        skip();
        return;
      }
      if (!controller.current) return;
      if (MOVEMENT_KEYS.has(key) || key === "shift") {
        if (MOVEMENT_KEYS.has(key)) {
          event.preventDefault();
          cancelAuto();
        }
        keys.current.add(key);
        updateMovement();
      } else if (key === " " || key === "e") {
        if (
          key === " " &&
          event.target instanceof HTMLElement &&
          event.target.closest("button, summary, a, [role='button']")
        )
          return;
        event.preventDefault();
        if (event.repeat) return;
        cancelAuto();
        if (key === " ") controller.current.jump();
        else controller.current.interact();
      }
    };
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!keys.current.delete(key)) return;
      updateMovement();
    };
    const reset = () => {
      stopInput();
      cancelAuto();
    };
    const visibility = () => {
      if (document.hidden) reset();
    };
    const shortcuts = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) reset();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keydown", shortcuts);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keydown", shortcuts);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
      stopInput();
    };
  }, [cancelAuto, skip, phase, stopInput, updateMovement]);

  useEffect(() => {
    const pending = timers;
    return () => {
      pending.current.forEach(window.clearTimeout);
      pending.current = [];
    };
  }, []);

  const interactive = status === "ready" && phase === "walk";
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!interactive || event.ctrlKey || event.metaKey) return;
    if (
      event.target instanceof HTMLElement &&
      event.target.closest(".aw-discovery-list, .aw-help-content")
    )
      return;
    const factor =
      event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? window.innerHeight
          : 1;
    controller.current?.zoom(
      Math.max(-0.15, Math.min(0.15, event.deltaY * factor * 0.0015)),
    );
  };
  const onDragStart = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.button !== 0 || drag.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      dx: 0,
      dy: 0,
    };
  };
  const onDragMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId || !interactive) return;
    current.dx = event.clientX - current.x;
    current.dy = event.clientY - current.y;
    if (!current.moved && Math.hypot(current.dx, current.dy) >= 8) {
      current.moved = true;
      cancelAuto();
    }
    if (current.moved) updateMovement();
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>, tapped: boolean) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    controller.current?.move(0, 0);
    if (
      tapped &&
      interactive &&
      !current.moved &&
      Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8
    ) {
      cancelAuto();
      controller.current?.walkTo(event.clientX, event.clientY);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const padEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (!pad.current.delete(event.pointerId)) return;
    updateMovement();
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const replay = () => {
    stopInput();
    cancelAuto();
    runRef.current = false;
    setRunning(false);
    origin.current = null;
    if (stage.current) stage.current.dataset.moved = "false";
    controller.current?.reset();
  };

  return (
    <>
      <div inert={phase !== "done"}>{children}</div>
      <noscript>
        <div className="aw-no-script">
          <p>The interactive neighbourhood needs JavaScript.</p>
          <a href="https://arreywaah.com/">Visit Arrey Waah</a>
        </div>
      </noscript>
      {phase !== "done" ? (
        <div
          ref={stage}
          className="aw-stage"
          data-phase={phase}
          data-status={status}
          role="region"
          aria-label="Explore the fictional Arrey Waah 3D neighbourhood"
          onWheel={onWheel}
        >
          <div ref={host} className="aw-canvas" aria-hidden="true" />
          <div className="aw-arrival-wash" />
          <div
            className="aw-drag"
            aria-hidden="true"
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={(event) => endDrag(event, true)}
            onPointerCancel={(event) => endDrag(event, false)}
            onLostPointerCapture={(event) => endDrag(event, false)}
          />

          <div className="aw-ui">
            <div className="aw-ui-top">
              <a
                className="aw-brand"
                href="#main"
                onClick={(event) => {
                  event.preventDefault();
                  skip();
                }}
                aria-label="Arrey Waah, open company site"
              >
                WA AH
              </a>
              <div className="aw-top-tools">
                <details className="aw-discoveries aw-panel">
                  <summary
                    aria-label={`${snapshot.discovered.length} of ${DISCOVERIES.length} discoveries. Show checklist`}
                  >
                    <span>Discoveries</span>{" "}
                    <strong>
                      {snapshot.discovered.length}/{DISCOVERIES.length}
                    </strong>
                  </summary>
                  <div className="aw-discovery-list">
                    <p>Optional detours. The office is always open.</p>
                    <ul>
                      {DISCOVERIES.map((discovery) => {
                        const found = snapshot.discovered.includes(
                          discovery.id,
                        );
                        return (
                          <li key={discovery.id} data-found={found}>
                            <span aria-hidden="true">{found ? "✓" : "○"}</span>
                            <span>{discovery.name}</span>
                            <span className="aw-discovery-state">
                              {found ? "Found" : "To find"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </details>
                <details className="aw-help-menu aw-panel">
                  <summary>Help</summary>
                  <div className="aw-help-content">
                    <p>
                      WASD or arrows to roam. Shift to run. Space to hop. E to
                      interact.
                    </p>
                    <p>
                      Tap the ground to walk there, or drag to steer. Scroll to
                      zoom.
                    </p>
                    <p>
                      Guide me follows the corridor to the office. Detours are
                      optional.
                    </p>
                    <button
                      type="button"
                      className="aw-btn aw-btn-secondary"
                      disabled={!interactive}
                      onClick={replay}
                    >
                      Reset / replay
                    </button>
                  </div>
                </details>
                <button
                  type="button"
                  className="aw-btn aw-btn-secondary aw-skip"
                  onClick={skip}
                >
                  Skip to site
                </button>
              </div>
            </div>

            {status === "loading" ? (
              <div className="aw-loading aw-panel" role="status">
                <span className="aw-loading-mark" aria-hidden="true">
                  WA AH
                </span>
                <p>Opening the neighbourhood…</p>
                <small>A little wander before the work.</small>
              </div>
            ) : status === "error" ? (
              <div className="aw-error aw-panel" role="alert">
                <h2>The neighbourhood couldn’t load.</h2>
                <p>
                  The company site is still here. Skip ahead, or give the scene
                  another try.
                </p>
                <button
                  type="button"
                  className="aw-btn"
                  onClick={() => {
                    stopInput();
                    setSnapshot(INITIAL_SNAPSHOT);
                    setStatus("loading");
                    setAttempt((value) => value + 1);
                  }}
                >
                  Try again
                </button>
              </div>
            ) : null}

            {status === "ready" ? (
              <div className="aw-ui-bottom">
                <div
                  className="aw-play-note aw-panel"
                  role="status"
                  aria-atomic="true"
                >
                  <p>
                    {phase === "enter"
                      ? "You’re here. Come on in."
                      : snapshot.message || INITIAL_SNAPSHOT.message}
                  </p>
                </div>
                <div className="aw-play-controls">
                  <div
                    className="aw-dpad aw-panel"
                    role="group"
                    aria-label="Directional movement"
                  >
                    {DIRECTIONS.map((direction) => (
                      <button
                        key={direction.name}
                        type="button"
                        className={`aw-pad-button ${direction.className}`}
                        aria-label={direction.name}
                        disabled={!interactive}
                        onPointerDown={(event) => {
                          if (!interactive || event.button !== 0) return;
                          event.currentTarget.setPointerCapture(
                            event.pointerId,
                          );
                          pad.current.set(event.pointerId, direction);
                          cancelAuto();
                          updateMovement();
                        }}
                        onPointerUp={padEnd}
                        onPointerCancel={padEnd}
                        onLostPointerCapture={padEnd}
                        onContextMenu={(event) => event.preventDefault()}
                        onClick={(event) => {
                          if (event.detail !== 0 || !interactive) return;
                          cancelAuto();
                          controller.current?.move(
                            direction.x,
                            direction.y,
                            runRef.current,
                          );
                          timers.current.push(
                            window.setTimeout(
                              () => controller.current?.move(0, 0),
                              180,
                            ),
                          );
                        }}
                      >
                        {direction.label}
                      </button>
                    ))}
                  </div>
                  <div className="aw-actions aw-panel">
                    <button
                      type="button"
                      className="aw-btn aw-interact"
                      disabled={!interactive || snapshot.nearby === null}
                      onClick={() => {
                        cancelAuto();
                        controller.current?.interact();
                      }}
                    >
                      <kbd aria-hidden="true">E</kbd>
                      <span>{snapshot.prompt || "Explore nearby"}</span>
                    </button>
                    <div className="aw-secondary-actions">
                      <button
                        type="button"
                        className="aw-btn aw-btn-secondary"
                        aria-pressed={snapshot.automatic}
                        disabled={!interactive}
                        onClick={() => {
                          stopInput();
                          controller.current?.autoWalk(!snapshot.automatic);
                        }}
                      >
                        {snapshot.automatic ? "Stop guide" : "Guide me"}
                      </button>
                      <button
                        type="button"
                        className="aw-btn aw-btn-secondary"
                        disabled={!interactive}
                        onClick={() => {
                          cancelAuto();
                          controller.current?.jump();
                        }}
                      >
                        Hop<span className="aw-key-hint"> Space</span>
                      </button>
                      <button
                        type="button"
                        className="aw-btn aw-btn-secondary aw-run"
                        aria-pressed={running}
                        disabled={!interactive}
                        onClick={() => {
                          runRef.current = !runRef.current;
                          setRunning(runRef.current);
                          cancelAuto();
                          updateMovement();
                        }}
                      >
                        Run
                      </button>
                    </div>
                  </div>
                </div>
                <p className="aw-help aw-panel">
                  <span className="aw-help-desktop">
                    WASD / arrows to roam · Shift to run
                  </span>
                  <span className="aw-help-touch">
                    Tap to walk. Drag to steer.
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
