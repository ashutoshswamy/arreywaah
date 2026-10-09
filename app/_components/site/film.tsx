"use client";

import { useEffect, useRef, useState } from "react";

type Props = { src: string; title: string; label: string; fallback: string };

/** Remote films load only after an explicit play request, never behind the walk. */
export function StudioFilm({ src, title, label, fallback }: Props) {
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!requested) return;
    const player = video.current;
    if (!player) return;
    void player.play().catch(() => {
      // Playback policy may require the visitor to use the native play control.
      setStatus(player.error ? "error" : "ready");
    });
    return () => player.pause();
  }, [requested]);

  return (
    <div className="studio-film">
      <div className="studio-film-screen" data-requested={requested}>
        {requested ? (
          <video
            ref={video}
            src={src}
            controls
            playsInline
            preload="none"
            aria-label={title}
            onLoadedData={() => setStatus("ready")}
            onError={() => setStatus("error")}
          >
            <a href={fallback}>Open {title}</a>
          </video>
        ) : (
          <div className="studio-film-invitation">
            <span className="studio-film-wordmark" aria-hidden="true">
              WA AH
            </span>
            <p>{title}</p>
            <button
              type="button"
              className="studio-button"
              onClick={() => setRequested(true)}
            >
              {label} <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
      </div>
      <div className="studio-film-caption">
        <span role="status">
          {requested
            ? status === "loading"
              ? "Loading film. Playback controls are available."
              : status === "error"
                ? "The film couldn’t load. Open it on the studio site."
                : "Use the player controls for playback."
            : "Play on demand. No autoplay."}
        </span>
        <a href={fallback} target="_blank" rel="noopener noreferrer">
          Open at source <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
