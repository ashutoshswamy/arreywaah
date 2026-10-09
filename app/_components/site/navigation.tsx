"use client";

import { useRef } from "react";
import { NAV } from "../../_data/content";

export function MobileNavigation() {
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => { if (menu.current) menu.current.open = false; };

  return (
    <details
      ref={menu}
      className="studio-mobile-nav"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        close();
        menu.current?.querySelector("summary")?.focus();
      }}
    >
      <summary>Menu <span aria-hidden="true">+</span></summary>
      <nav aria-label="Mobile primary">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} onClick={close}>
            {item.label}<span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
    </details>
  );
}
