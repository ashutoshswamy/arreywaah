import { COMPANY } from "../../_data/content";
import { MediaSlot } from "./media-slot";

export function Hero() {
  return (
    <section
      className="studio-hero studio-container"
      aria-labelledby="hero-title"
    >
      <div className="studio-hero-copy">
        <p className="studio-eyebrow">{COMPANY.name}</p>
        <h1 id="hero-title">
          Make them say <span>waah.</span>
        </h1>
        <p className="studio-hero-intro">
          Films, music, art and brand stories. We turn your ideas into something
          people feel.
        </p>
        <div className="studio-actions">
          <a className="studio-button" href="#work">
            View work <span aria-hidden="true">↗</span>
          </a>
          <a className="studio-text-link" href="#about">
            Meet the studio <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="studio-hero-visual">
        <MediaSlot
          id="hero"
          label="The opening shot"
          format="Portrait photograph / 4:5"
        />
      </div>
    </section>
  );
}
