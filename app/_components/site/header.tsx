import { NAV } from "../../_data/content";
import { MobileNavigation } from "./navigation";

export function SiteHeader() {
  return (
    <header className="studio-header">
      <a href="#main" className="studio-skip-link">
        Skip to content
      </a>
      <div className="studio-container studio-header-inner">
        <a
          href="#main"
          className="studio-wordmark"
          aria-label="Arrey Waah, back to top"
        >
          WA AH
        </a>
        <nav aria-label="Primary" className="studio-desktop-nav">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                item.href === "#contact" ? "studio-nav-contact" : undefined
              }
            >
              {item.label}
              {item.href === "#contact" ? (
                <span aria-hidden="true">↗</span>
              ) : null}
            </a>
          ))}
        </nav>
        <MobileNavigation />
      </div>
    </header>
  );
}
