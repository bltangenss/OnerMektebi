"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

export type PlayerLabels = {
  play: string;
  pause: string;
  progress: string;
  volume: string;
  mute: string;
  unmute: string;
};

type Props = {
  src: string;
  title: string;
  labels: PlayerLabels;
  tone?: "light" | "dark";
};

const PLAY_EVENT = "oner:play";

function time(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/**
 * Настоящий аудиоплеер. Ничего не играет само: только по нажатию.
 * Когда начинает играть один плеер, остальные на странице ставятся на паузу.
 */
export function AudioPlayer({ src, title, labels, tone = "light" }: Props) {
  const audio = useRef<HTMLAudioElement>(null);
  const id = useId();
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) audio.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, onOther);
    return () => window.removeEventListener(PLAY_EVENT, onOther);
  }, [id]);

  const toggle = async () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
      try {
        await el.play();
      } catch {
        setPlaying(false);
      }
    } else {
      el.pause();
    }
  };

  const dark = tone === "dark";
  const pct = duration ? (current / duration) * 100 : 0;
  const trackStyle = {
    ["--value" as string]: `${pct}%`,
    ["--track-fill" as string]: dark ? "var(--color-gold)" : "var(--color-wine)",
    ["--track-rest" as string]: dark ? "rgb(248 246 241 / 0.25)" : "rgb(36 36 36 / 0.18)",
  };

  return (
    <div className={`flex items-center gap-4 ${dark ? "text-milk" : "text-ink"}`}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={`${playing ? labels.pause : labels.play}: ${title}`}
        className={`flex size-14 shrink-0 items-center justify-center rounded-full transition-colors ${
          dark ? "bg-gold text-ink hover:bg-[#d3ad78]" : "bg-wine text-milk hover:bg-wine-deep"
        }`}
      >
        {playing ? <Pause className="size-6" aria-hidden /> : <Play className="ml-0.5 size-6" aria-hidden />}
      </button>
      <div className="min-w-0 flex-1">
        <input
          type="range"
          className="range w-full"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          aria-label={labels.progress}
          aria-valuetext={`${time(current)} / ${time(duration)}`}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (audio.current) audio.current.currentTime = v;
            setCurrent(v);
          }}
          style={trackStyle}
        />
        <div className={`flex justify-between text-xs tabular-nums ${dark ? "text-muted-on-dark" : "text-muted"}`}>
          <span>{time(current)}</span>
          <span>{time(duration)}</span>
        </div>
      </div>
      <div className="hidden items-center gap-1 sm:flex">
        <button
          type="button"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            if (audio.current) audio.current.muted = next;
          }}
          aria-label={muted ? labels.unmute : labels.mute}
          className="flex size-10 items-center justify-center rounded-full"
        >
          {muted || volume === 0 ? <VolumeX className="size-5" aria-hidden /> : <Volume2 className="size-5" aria-hidden />}
        </button>
        <input
          type="range"
          className="range w-20"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          aria-label={labels.volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            if (audio.current) audio.current.volume = v;
          }}
          style={{ ...trackStyle, ["--value" as string]: `${volume * 100}%` }}
        />
      </div>
    </div>
  );
}
