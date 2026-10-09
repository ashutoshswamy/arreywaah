"use client";

import { useEffect, useRef, useState } from "react";

type VideoProps = {
  src: string;
  title: string;
  description: string;
  buttonLabel: string;
};

export function StudioVideo({ src, title, description, buttonLabel }: VideoProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const video = useRef<HTMLVideoElement>(null);
  const active = status === "loading" || status === "ready";

  useEffect(() => {
    if (active) video.current?.focus();
  }, [active]);

  return (
    <div className="studio-video">
      <div className="studio-video-frame">
        {active ? (
          <video
            ref={video}
            src={src}
            controls
            playsInline
            preload="none"
            tabIndex={0}
            aria-label={title}
            onLoadedData={() => setStatus("ready")}
            onCanPlay={() => setStatus("ready")}
            onWaiting={() => setStatus("loading")}
            onPlaying={() => setStatus("ready")}
            onError={() => setStatus("error")}
          >
            Your browser cannot play this video. Use the video link below.
          </video>
        ) : (
          <div className="studio-video-placeholder">
            <p className="studio-video-title">{title}</p>
            <p className="studio-video-description">{description}</p>
            <button className="studio-button" type="button" onClick={() => setStatus("loading")}>
              {status === "error" ? "Try again" : buttonLabel}
            </button>
            <p className="studio-video-note">Loads on request. Use the player controls to play.</p>
          </div>
        )}
      </div>
      <div className="studio-video-footer">
        <p role="status" aria-live="polite">
          {status === "loading"
            ? "Video selected. Press play in the player; loading may take a moment."
            : status === "error"
              ? "The video could not load. Try again or open the original below."
              : "Original studio video. Sound available in the player."}
        </p>
        <a href={src} target="_blank" rel="noopener noreferrer" className="studio-text-link">
          Open video <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
