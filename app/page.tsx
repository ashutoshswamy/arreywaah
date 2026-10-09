import { Experience } from "./_components/walk/experience";
import { SiteHeader } from "./_components/site/header";
import { Hero } from "./_components/site/hero";
import { InteriorMotion } from "./_components/site/interior-motion";
import {
  About,
  Contact,
  Services,
  Team,
  WaahArt,
  Work,
} from "./_components/site/sections";

export default function Home() {
  return (
    <Experience>
      <div className="aw-interior">
        <InteriorMotion />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <Services />
          <Work />
          <WaahArt />
          <Team />
          <About />
          <Contact />
        </main>
      </div>
    </Experience>
  );
}
