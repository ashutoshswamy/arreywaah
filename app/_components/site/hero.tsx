import { COMPANY, SERVICES } from "../../_data/content";

export function Hero() {
  const ticker = SERVICES.flatMap((s) => s.tags);

  return (
    <section className="bg-marigold text-ink" aria-labelledby="hero-title">
      <div className="relative mx-auto max-w-7xl overflow-hidden px-5 pt-12 pb-10 md:pt-20 md:pb-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] md:text-sm">
          {COMPANY.name}
        </p>

        <h1
          id="hero-title"
          className="mt-6 font-display text-[clamp(5.2rem,23vw,20rem)] leading-[0.8] tracking-tight"
        >
          Arrey
          <br />
          Waah!
        </h1>

        <div
          aria-hidden="true"
          className="absolute top-20 right-5 grid size-32 -rotate-[8deg] place-items-center rounded-full bg-gulal text-center font-display text-3xl leading-none text-chalk shadow-[6px_6px_0_var(--ink)] sm:size-40 sm:text-4xl md:top-24 md:right-12 md:size-56 md:text-6xl"
          lang="hi"
        >
          अरे
          <br />
          वाह!
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-[1.3fr_1fr] md:gap-16">
          <p className="max-w-2xl font-display text-3xl leading-tight md:text-5xl">
            {COMPANY.tagline}
          </p>
          <div className="space-y-4 text-lg leading-relaxed font-medium">
            <p>{COMPANY.intro}</p>
            <p className="font-mono text-sm uppercase tracking-widest">
              You made it. Come in and look around.
            </p>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden border-y-2 border-ink bg-ink py-4 text-chalk"
        aria-hidden="true"
      >
        <div className="aw-marquee-track flex w-max whitespace-nowrap">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex gap-10 pr-10">
              {ticker.map((item, i) => (
                <li
                  key={`${copy}-${i}`}
                  className="flex items-center gap-10 font-display text-2xl uppercase tracking-wide"
                >
                  {item}
                  <span className="text-marigold">✦</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
