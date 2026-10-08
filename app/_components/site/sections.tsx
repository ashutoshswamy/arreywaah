import {
  ABOUT,
  COMPANY,
  SERVICES,
  TEAM,
  WAAH_ART,
  WORK,
} from "../../_data/content";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] opacity-80 md:text-sm">
      {children}
    </p>
  );
}

export function Services() {
  return (
    <section id="services" className="bg-ink px-5 py-20 md:py-28" aria-labelledby="services-title">
      <div className="mx-auto max-w-7xl">
        <Eyebrow>Services</Eyebrow>
        <h2 id="services-title" className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] text-marigold md:text-7xl">
          Everything from the first idea to the final cut.
        </h2>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <li
              key={service.title}
              className="group flex flex-col rounded-2xl border border-chalk/15 bg-ink-soft/60 p-7 transition-colors hover:border-marigold"
            >
              <h3 className="font-display text-3xl text-chalk">{service.title}</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-chalk/80">{service.body}</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${service.title} includes`}>
                {service.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-chalk/25 px-3 py-1 font-mono text-xs text-chalk/85 transition-colors group-hover:border-marigold/70"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Work() {
  return (
    <section id="work" className="bg-ink-soft px-5 py-20 md:py-28" aria-labelledby="work-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Our work</Eyebrow>
            <h2 id="work-title" className="mt-4 font-display text-5xl leading-[0.95] text-chalk md:text-7xl">
              Now showing.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-chalk/80">
            Imagination meets execution. A few of the films, tracks and launches we have made.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORK.map((item) => (
            <li key={item.title} className="aw-ticket flex min-h-60 flex-col px-9 py-8 text-ink">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em]">{item.kind}</p>
              <h3 className="mt-4 font-display text-3xl leading-tight md:text-4xl">{item.title}</h3>
              <p className="mt-auto border-t-2 border-dashed border-ink/40 pt-4 text-sm font-medium leading-relaxed">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-base text-chalk/80">
          More films and behind-the-scenes on{" "}
          <a
            href={COMPANY.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-marigold underline underline-offset-4 hover:text-chalk"
          >
            Instagram {COMPANY.instagram.handle}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function WaahArt() {
  return (
    <section id="waah-art" className="bg-gulal px-5 py-20 text-chalk md:py-28" aria-labelledby="art-title">
      <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
        <div>
          <Eyebrow>Art</Eyebrow>
          <h2 id="art-title" className="mt-4 font-display text-6xl leading-[0.9] md:text-8xl">
            {WAAH_ART.title}
          </h2>
          <p className="mt-8 max-w-xl text-xl leading-relaxed font-medium">{WAAH_ART.body}</p>
        </div>

        <svg
          viewBox="0 0 420 340"
          role="img"
          aria-label="Two framed portraits on a wall"
          className="mx-auto w-full max-w-lg"
        >
          <rect x="30" y="30" width="190" height="260" fill="#17123F" />
          <rect x="44" y="44" width="162" height="232" fill="#FFB81C" />
          <circle cx="125" cy="130" r="38" fill="#17123F" />
          <path d="M60 276 q65 -110 130 0 z" fill="#17123F" />
          <rect x="250" y="70" width="140" height="190" fill="#17123F" />
          <rect x="262" y="82" width="116" height="166" fill="#27C2B0" />
          <circle cx="320" cy="150" r="28" fill="#17123F" />
          <path d="M272 248 q48 -84 96 0 z" fill="#17123F" />
          <rect x="30" y="300" width="360" height="6" fill="#17123F" opacity="0.35" />
        </svg>
      </div>
    </section>
  );
}

export function Team() {
  return (
    <section id="team" className="bg-ink px-5 py-20 md:py-28" aria-labelledby="team-title">
      <div className="mx-auto max-w-7xl">
        <Eyebrow>Our team</Eyebrow>
        <h2 id="team-title" className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] text-marigold md:text-7xl">
          A circus of creative chaos, with a plan.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-chalk/80">
          Directors who dream in pixels, content wizards spinning stories, and an artist who keeps us honest.
        </p>

        <ul className="mt-14 border-b border-chalk/20">
          {TEAM.map((person) => (
            <li
              key={person.name}
              className="flex flex-col gap-1 border-t border-chalk/20 px-2 py-6 transition-colors hover:bg-marigold hover:text-ink md:flex-row md:items-baseline md:justify-between md:px-6"
            >
              <span className="font-display text-4xl md:text-6xl">{person.name}</span>
              <span className="font-mono text-sm uppercase tracking-[0.16em] opacity-80">{person.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="bg-marigold px-5 py-20 text-ink md:py-28" aria-labelledby="about-title">
      <div className="mx-auto max-w-7xl">
        <Eyebrow>About us</Eyebrow>
        <h2 id="about-title" className="mt-4 max-w-4xl font-display text-4xl leading-[1.05] md:text-6xl">
          {ABOUT.lead}
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div className="space-y-6 text-lg leading-relaxed font-medium md:text-xl">
            {ABOUT.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <figure className="self-start rounded-2xl bg-ink p-8 text-chalk">
            <p className="font-display text-5xl leading-none text-marigold" lang="hi">
              अरे वाह
            </p>
            <figcaption className="mt-5 text-base leading-relaxed text-chalk/85">
              {COMPANY.nameMeaning}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="bg-ink-deep px-5 pt-20 pb-10 md:pt-28" aria-labelledby="contact-title">
      <div className="mx-auto max-w-7xl">
        <Eyebrow>Contact</Eyebrow>
        <h2 id="contact-title" className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] text-chalk md:text-8xl">
          Ready to elevate your brand? <span className="text-marigold">Let&rsquo;s connect.</span>
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-chalk/80">
          Drop us a message, send a carrier pigeon, or break into the funky pigeon dance. We are all ears.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          {COMPANY.email ? (
            <a
              href={`mailto:${COMPANY.email}`}
              className="rounded-full bg-marigold px-7 py-4 text-base font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              {COMPANY.email}
            </a>
          ) : null}
          {COMPANY.phone ? (
            <a
              href={`tel:${COMPANY.phone.replace(/\s+/g, "")}`}
              className="rounded-full bg-marigold px-7 py-4 text-base font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              {COMPANY.phone}
            </a>
          ) : null}
          <a
            href={COMPANY.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-marigold px-7 py-4 text-base font-bold text-ink transition-transform hover:-translate-y-0.5"
          >
            Message us on Instagram
          </a>
          <a
            href={COMPANY.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-chalk/40 px-7 py-4 text-base font-bold text-chalk transition-colors hover:border-marigold hover:text-marigold"
          >
            arreywaah.com
          </a>
        </div>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-chalk/15 pt-6 text-sm text-chalk/60">
          <span className="font-display text-xl text-marigold">WA AH</span>
          <span>&copy; {COMPANY.name}. All rights reserved.</span>
        </footer>
      </div>
    </section>
  );
}
