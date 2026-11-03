"use client";

import { useMemo, useState } from "react";
import { GalleryHorizontalEnd } from "lucide-react";
import type { GalleryLabels, GalleryWork } from "./types";
import { Viewer } from "./Viewer";
import { WorkCard } from "./WorkCard";

type Props = {
  works: GalleryWork[];
  categories: { slug: string; name: string }[];
  labels: GalleryLabels;
  showFilters?: boolean;
  showExhibition?: boolean;
};

// Чередование пропорций даёт живую асимметричную сетку без «каменной кладки».
const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[5/4]", "aspect-square", "aspect-[4/5]", "aspect-[5/4]"];

export function Gallery({ works, categories, labels, showFilters = true, showExhibition = false }: Props) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const [exhibitionIndex, setExhibitionIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? works : works.filter((w) => w.category === filter)),
    [works, filter],
  );
  const drawings = useMemo(() => works.filter((w) => w.kind === "image" && w.image), [works]);
  const present = categories.filter((c) => works.some((w) => w.category === c.slug));

  return (
    <div>
      {(showFilters && present.length > 1) || (showExhibition && drawings.length > 1) ? (
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {showFilters && present.length > 1 ? (
            <div role="group" aria-label={labels.filterLabel} className="-mx-1 flex flex-wrap gap-2">
              {[{ slug: "all", name: labels.all }, ...present].map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={filter === c.slug}
                  onClick={() => setFilter(c.slug)}
                  className="min-h-11 rounded-full border border-line px-5 text-[0.95rem] font-medium transition-colors hover:border-wine hover:text-wine aria-pressed:border-wine aria-pressed:bg-wine aria-pressed:text-milk"
                >
                  {c.name}
                  <span className="ml-2 text-sm tabular-nums opacity-70">
                    {c.slug === "all" ? works.length : works.filter((w) => w.category === c.slug).length}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          {showExhibition && drawings.length > 1 && (
            <button type="button" onClick={() => setExhibitionIndex(0)} className="btn btn-outline shrink-0 text-wine">
              <GalleryHorizontalEnd className="size-5" aria-hidden />
              {labels.exhibitionOpen}
            </button>
          )}
        </div>
      ) : null}

      <ul key={filter} className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {visible.map((work, i) => (
          <li key={work.id} className="fade-in" style={{ ["--d" as string]: `${Math.min(i, 6) * 50}ms` }}>
            <WorkCard work={work} labels={labels} aspect={ASPECTS[i % ASPECTS.length]} onOpen={() => setOpen(i)} />
          </li>
        ))}
      </ul>

      <Viewer works={visible} index={open} onIndex={setOpen} labels={labels} />
      {showExhibition && (
        <Viewer works={drawings} index={exhibitionIndex} onIndex={setExhibitionIndex} labels={labels} exhibition />
      )}
    </div>
  );
}
