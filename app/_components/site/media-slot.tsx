type MediaSlotProps = {
  id: string;
  label: string;
  format: string;
  className?: string;
};

/** Intentionally empty: replace with approved original photography, never old-site assets. */
export function MediaSlot({ id, label, format, className = "" }: MediaSlotProps) {
  return (
    <div
      className={`studio-media-slot ${className}`}
      data-media-slot={id}
      role="group"
      aria-label={`Reserved image space: ${label}. Recommended format: ${format}.`}
    >
      <div className="studio-media-slot-label">
        <span className="studio-media-slot-mark" aria-hidden="true">+</span>
        <p>{label}</p>
        <span>{format}</span>
      </div>
      <span className="studio-media-slot-note">Image space reserved</span>
    </div>
  );
}
