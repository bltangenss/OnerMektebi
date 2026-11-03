"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import type { GalleryLabels, GalleryWork } from "./types";
import { StringsTile } from "./WorkCard";

type Props = {
  works: GalleryWork[];
  index: number | null;
  onIndex: (i: number | null) => void;
  labels: GalleryLabels;
  /** Спокойный режим выставки для рисунков. */
  exhibition?: boolean;
};

/**
 * Подробный просмотр на нативном <dialog>: фокус удерживается внутри,
 * Escape закрывает, стрелки и свайп листают работы.
 */
export function Viewer({ works, index, onIndex, labels, exhibition }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const work = index === null ? undefined : works[index];
  const many = works.length > 1;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (work && !dialog.open) dialog.showModal();
    if (!work && dialog.open) dialog.close();
  }, [work]);

  const go = (step: number) => {
    if (index === null || !many) return;
    onIndex((index + step + works.length) % works.length);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "VIDEO") return;
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  const fg = exhibition ? "text-ink" : "text-milk";
  const sub = exhibition ? "text-muted" : "text-[#cfc7bf]";
  const ctrl = exhibition
    ? "bg-milk text-ink hover:bg-white shadow-[var(--shadow-soft)]"
    : "bg-white/10 text-milk hover:bg-white/20";

  return (
    <dialog
      ref={ref}
      className={`viewer ${exhibition ? "exhibition" : "on-dark"}`}
      onClose={() => onIndex(null)}
      onKeyDown={onKey}
      aria-label={work?.title}
    >
      {work && (
        <div className={`flex h-full flex-col ${fg}`}>
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-5">
            <p className={`text-sm tabular-nums ${sub}`}>
              {many && `${(index ?? 0) + 1} / ${works.length}`}
            </p>
            <button
              type="button"
              onClick={() => onIndex(null)}
              className={`flex size-12 items-center justify-center rounded-full transition-colors ${ctrl}`}
              aria-label={labels.close}
              autoFocus
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <Media key={work.id} work={work} labels={labels} exhibition={exhibition} />

            {many && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className={`absolute left-4 hidden size-14 items-center justify-center rounded-full transition-colors md:flex ${ctrl}`}
                  aria-label={labels.prev}
                >
                  <ChevronLeft className="size-7" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className={`absolute right-4 hidden size-14 items-center justify-center rounded-full transition-colors md:flex ${ctrl}`}
                  aria-label={labels.next}
                >
                  <ChevronRight className="size-7" aria-hidden />
                </button>
              </>
            )}
          </div>

          <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-6 md:pb-8">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="display text-[2rem] md:text-[2.4rem]">{work.title}</p>
                <p className={`mt-1 text-sm ${sub}`}>
                  {[work.categoryName, work.author ?? labels.anonymous, work.date].join(" · ")}
                  {work.isDemo && ` · ${labels.demoBadge}`}
                </p>
                {work.description && <p className={`mt-2 ${sub}`}>{work.description}</p>}
              </div>
              {many && (
                <div className="flex gap-2 md:hidden">
                  <button type="button" onClick={() => go(-1)} className={`flex size-12 items-center justify-center rounded-full ${ctrl}`} aria-label={labels.prev}>
                    <ChevronLeft className="size-6" aria-hidden />
                  </button>
                  <button type="button" onClick={() => go(1)} className={`flex size-12 items-center justify-center rounded-full ${ctrl}`} aria-label={labels.next}>
                    <ChevronRight className="size-6" aria-hidden />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

function Media({ work, labels, exhibition }: { work: GalleryWork; labels: GalleryLabels; exhibition?: boolean }) {
  if (work.kind === "video") {
    if (work.youtubeId) {
      return (
        <div className="aspect-video w-full max-w-5xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(work.youtubeId)}`}
            title={work.title}
            className="size-full rounded-felt"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <video
        src={work.mediaUrl}
        poster={work.image}
        controls
        playsInline
        preload="metadata"
        className="max-h-full w-full max-w-5xl rounded-felt bg-black"
      >
        {labels.videoFallback}
      </video>
    );
  }

  if (work.kind === "audio") {
    return (
      <div className="w-full max-w-xl">
        <div className="relative aspect-[4/3] overflow-hidden rounded-felt">
          {work.image ? (
            <Image src={work.image} alt="" fill sizes="36rem" className="object-cover" unoptimized={work.image.endsWith(".svg")} />
          ) : (
            <StringsTile className="size-full" />
          )}
        </div>
        {work.mediaUrl && (
          <div className="mt-6">
            <AudioPlayer src={work.mediaUrl} title={work.title} labels={labels} tone="dark" />
          </div>
        )}
      </div>
    );
  }

  if (!work.image) return null;
  return (
    <div className={`relative size-full ${exhibition ? "max-h-[78%] max-w-4xl" : ""}`}>
      <Image
        src={work.image}
        alt={work.description ? `${work.title}. ${work.description}` : work.title}
        fill
        sizes="100vw"
        unoptimized={work.image.endsWith(".svg")}
        className={`object-contain ${exhibition ? "drop-shadow-[0_24px_40px_rgba(36,36,36,0.22)]" : ""}`}
      />
    </div>
  );
}
