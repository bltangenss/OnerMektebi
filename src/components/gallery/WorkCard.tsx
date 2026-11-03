import { Play } from "lucide-react";
import { Picture } from "@/components/ui/Picture";
import type { GalleryLabels, GalleryWork } from "./types";

type Props = {
  work: GalleryWork;
  labels: GalleryLabels;
  aspect: string;
  onOpen: () => void;
};

export function StringsTile({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" className={className} aria-hidden>
      <rect width="400" height="300" fill="var(--color-wine)" />
      <line x1="0" y1="140" x2="400" y2="140" stroke="var(--color-gold)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <line x1="0" y1="160" x2="400" y2="160" stroke="var(--color-gold)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function WorkCard({ work, labels, aspect, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full text-left"
      aria-label={`${labels.open}: ${work.title}`}
    >
      <div className={`relative overflow-hidden rounded-felt bg-sand ${aspect}`}>
        <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
          {work.image ? (
            <Picture src={work.image} alt="" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
          ) : (
            <StringsTile className="size-full" />
          )}
        </div>
        {work.kind !== "image" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-milk/92 text-wine shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-1 size-7" aria-hidden />
            </span>
          </span>
        )}
        {work.isDemo && (
          <span className="absolute top-3 left-3 rounded bg-gold px-2 py-1 text-xs font-semibold text-ink">
            {labels.demoBadge}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="font-semibold text-ink group-hover:text-wine">{work.title}</p>
        <p className="shrink-0 text-sm text-muted">{labels.kinds[work.kind]}</p>
      </div>
      <p className="text-sm text-muted">{work.categoryName}</p>
    </button>
  );
}
