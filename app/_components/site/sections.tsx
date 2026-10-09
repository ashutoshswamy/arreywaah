import { ABOUT, COMPANY, SERVICES, TEAM, WAAH_ART } from "../../_data/content";
import { MediaSlot } from "./media-slot";
import { WorkIndex } from "./work-index";

export function Services() {
  return (
    <section
      id="services"
      className="studio-section studio-services"
      aria-labelledby="services-title"
    >
      <div className="studio-container studio-services-layout">
        <div className="studio-service-intro studio-reveal">
          <h2 id="services-title">
            One idea.
            <br />
            Every possibility.
          </h2>
          <p className="studio-section-intro">
            A creative agency and production house. Bring us the whole story, or
            the part you need help telling.
          </p>
          <a href="#contact" className="studio-text-link">
            Contact <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="studio-service-list studio-reveal">
          {SERVICES.map((service, index) => (
            <details
              key={service.title}
              name="studio-services"
              className="studio-service"
              open={index === 0}
            >
              <summary>
                <h3>{service.title}</h3>
                <span className="studio-disclosure-mark" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="studio-service-body">
                <p>{service.body}</p>
                <ul aria-label={`${service.title} includes`}>
                  {service.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Work() {
  return (
    <section
      id="work"
      className="studio-section studio-work"
      aria-labelledby="work-title"
    >
      <div className="studio-container">
        <div className="studio-section-heading studio-reveal">
          <h2 id="work-title">Stories with a life of their own.</h2>
          <p className="studio-section-intro">
            Films, music videos and brand launches. Explore a selection of work
            by Arrey Waah.
          </p>
        </div>
        <div className="studio-reveal">
          <WorkIndex />
        </div>
      </div>
    </section>
  );
}

export function WaahArt() {
  return (
    <section
      id="waah-art"
      className="studio-section studio-art"
      aria-labelledby="art-title"
    >
      <div className="studio-container studio-art-layout">
        <div className="studio-art-visual studio-reveal">
          <MediaSlot
            id="waah-art"
            label="A Waah Art original"
            format="Artwork or process photograph / 4:5"
          />
        </div>
        <div className="studio-art-copy studio-reveal">
          <p className="studio-eyebrow">{WAAH_ART.title}</p>
          <h2 id="art-title">Some stories are made by hand.</h2>
          <p className="studio-section-intro">{WAAH_ART.body}</p>
          <div className="studio-art-mediums" aria-label="Waah Art services">
            <span>Portraits</span>
            <span>Artwork</span>
            <span>Commissions</span>
          </div>
          <a href="#contact" className="studio-text-link">
            Contact <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Team() {
  const [founder, ...team] = TEAM;
  return (
    <section
      id="team"
      className="studio-section studio-team"
      aria-labelledby="team-title"
    >
      <div className="studio-container">
        <div className="studio-section-heading studio-reveal">
          <h2 id="team-title">Different eyes. A shared vision.</h2>
          <p className="studio-section-intro">
            Meet the people behind the films, the ideas and the art.
          </p>
        </div>
        <ul className="studio-team-roster studio-reveal">
          <li className="studio-founder">
            <p className="studio-team-role">{founder.role}</p>
            <h3>{founder.name}</h3>
            <span className="studio-founder-brand" aria-hidden="true">
              WA AH
            </span>
          </li>
          {team.map((person) => (
            <li key={person.name}>
              <p className="studio-team-role">{person.role}</p>
              <h3>{person.name}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section
      id="about"
      className="studio-section studio-about"
      aria-labelledby="about-title"
    >
      <div className="studio-container">
        <div className="studio-about-statement studio-reveal">
          <h2 id="about-title">The reaction is the brief.</h2>
          <p>{COMPANY.nameMeaning}</p>
        </div>
        <div className="studio-about-photo studio-reveal">
          <MediaSlot
            id="studio"
            label="Inside Arrey Waah"
            format="Studio or behind-the-scenes photograph / 16:7"
          />
        </div>
        <div className="studio-about-copy studio-reveal">
          <p className="studio-about-name">{COMPANY.name}</p>
          <div>
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section
      id="contact"
      className="studio-section studio-contact"
      aria-labelledby="contact-title"
    >
      <div className="studio-container">
        <div className="studio-contact-layout studio-reveal">
          <h2 id="contact-title">Your next idea starts here.</h2>
          <div className="studio-contact-copy">
            <p>
              Tell us what you have in mind. Let’s find the right way to make
              it.
            </p>
            <a
              className="studio-button"
              href={COMPANY.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact <span aria-hidden="true">↗</span>
            </a>
            <p className="studio-contact-note">Message us on Instagram.</p>
            {COMPANY.email ? (
              <a className="studio-text-link" href={`mailto:${COMPANY.email}`}>
                {COMPANY.email}
              </a>
            ) : null}
            {COMPANY.phone ? (
              <a
                className="studio-text-link"
                href={`tel:${COMPANY.phone.replace(/\s+/g, "")}`}
              >
                {COMPANY.phone}
              </a>
            ) : null}
          </div>
        </div>
        <footer className="studio-footer">
          <a
            href="#main"
            className="studio-wordmark"
            aria-label="Arrey Waah, back to top"
          >
            WA AH
          </a>
          <span>&copy; {COMPANY.name}. All rights reserved.</span>
          <a
            href={COMPANY.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram <span aria-hidden="true">↗</span>
          </a>
          <a href="#main">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
