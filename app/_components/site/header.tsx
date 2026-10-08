import { NAV } from "../../_data/content";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-chalk/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <a
          href="#main"
          className="font-display text-2xl leading-none tracking-wide text-marigold"
          aria-label="Arrey Waah, back to top"
        >
          WA AH
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-chalk/85 transition-colors hover:bg-chalk/10 hover:text-chalk"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <details className="group relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-marigold px-4 py-2 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <ul className="absolute right-0 mt-3 w-56 rounded-2xl border border-chalk/15 bg-ink-deep p-2 shadow-2xl">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-base font-semibold text-chalk hover:bg-chalk/10"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </header>
  );
}
