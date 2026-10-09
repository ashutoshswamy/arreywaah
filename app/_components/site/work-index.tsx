"use client";

import { useState } from "react";
import { WORK } from "../../_data/content";
import { MediaSlot } from "./media-slot";

const FILTERS = ["All work", "Film", "Music", "Brands & events"] as const;
type Filter = (typeof FILTERS)[number];
type Project = (typeof WORK)[number];

function category(project: Project): Filter {
  if (project.kind === "Film trailer") return "Film";
  if (project.kind === "Music video" || project.kind === "Promotional track") return "Music";
  return "Brands & events";
}

export function WorkIndex() {
  const [filter, setFilter] = useState<Filter>("All work");
  const [selected, setSelected] = useState<string>("A Winter Tale at Shimla");
  const projects = WORK.filter((project) => filter === "All work" || category(project) === filter);
  const active = projects.find((project) => project.title === selected) ?? projects[0];
  const activeIndex = projects.findIndex((project) => project === active);

  const changeFilter = (value: Filter) => {
    setFilter(value);
    const first = WORK.find((project) => value === "All work" || category(project) === value);
    if (first) setSelected(first.title);
  };
  const move = (direction: number) => {
    const next = projects[(activeIndex + direction + projects.length) % projects.length];
    if (next) setSelected(next.title);
  };

  return (
    <div className="studio-work-index">
      <div className="studio-work-filters" role="group" aria-label="Filter projects">
        {FILTERS.map((value) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => changeFilter(value)}>
            {value}
          </button>
        ))}
      </div>
      {active ? (
        <div className="studio-work-stage">
          <div className="studio-project-list" role="group" aria-label="Select a project">
            {projects.map((project) => (
              <button
                key={project.title}
                type="button"
                aria-pressed={active.title === project.title}
                aria-controls="selected-project"
                onClick={() => setSelected(project.title)}
              >
                <span>{project.title}</span>
                <span className="studio-project-list-kind">{project.kind}</span>
                <span className="studio-project-list-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <article id="selected-project" className="studio-selected-project" aria-label="Selected project">
            <div key={active.title} className="studio-project-content">
              <MediaSlot
                id={`work-${WORK.indexOf(active) + 1}`}
                label={`Project still: ${active.title}`}
                format="Landscape still / 16:9"
                className="studio-project-media"
              />
              <div className="studio-project-caption" aria-live="polite" aria-atomic="true">
                <p className="studio-project-kind">{active.kind}</p>
                <h3>{active.title}</h3>
                <p className="studio-project-description">{active.detail}</p>
              </div>
            </div>
            <div className="studio-work-controls">
              <p>{projects.length} {projects.length === 1 ? "project" : "projects"} in this selection</p>
              <div role="group" aria-label="Browse selected projects">
                <button type="button" aria-label="Previous project" onClick={() => move(-1)} disabled={projects.length < 2}>←</button>
                <button type="button" aria-label="Next project" onClick={() => move(1)} disabled={projects.length < 2}>→</button>
              </div>
            </div>
          </article>
        </div>
      ) : (
        <div className="studio-work-empty">
          <h3>No projects in this selection.</h3>
          <button type="button" className="studio-button" onClick={() => changeFilter("All work")}>View work</button>
        </div>
      )}
    </div>
  );
}
