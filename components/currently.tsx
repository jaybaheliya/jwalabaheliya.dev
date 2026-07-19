"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Hammer, Pause, Play, Radio } from "lucide-react";

type CardKind = "building" | "reading" | "listening";

type CurrentItem = {
  icon: typeof Hammer;
  kind: CardKind;
  label: string;
  value: string;
  href?: string;
  image?: string;
  imagePosition?: string;
  imageWidthClass?: string;
  surfaceClass: string;
  textClass: string;
  metaClass: string;
  badge?: string;
};

const HANUMAN_AUDIO_SRC = "/currently/hanuman-chalisa.mp3";

const ITEMS: CurrentItem[] = [
  {
    icon: Hammer,
    kind: "building",
    label: "Building",
    value: "VIP Bags - Shopify PDP refresh",
    surfaceClass:
      "bg-[linear-gradient(135deg,#edf5ff_0%,#f6faff_100%)] dark:bg-[linear-gradient(135deg,#09111d_0%,#0d1727_100%)]",
    textClass: "text-slate-950 dark:text-slate-50",
    metaClass: "text-slate-500 dark:text-slate-400",
  },
  {
    icon: BookOpen,
    kind: "reading",
    label: "Reading",
    value: "Chrome for Developers",
    href: "https://developer.chrome.com/blog/",
    image: "/currently/chrome-dev-reading.png",
    imagePosition: "88% center",
    imageWidthClass: "sm:w-[57%]",
    badge: "Chrome Dev",
    surfaceClass:
      "bg-[linear-gradient(135deg,#f3f7ff_0%,#ebf2ff_100%)] dark:bg-[linear-gradient(135deg,#0f1726_0%,#121d2f_100%)]",
    textClass: "text-slate-950 dark:text-slate-50",
    metaClass: "text-slate-500 dark:text-slate-400",
  },
  {
    icon: Radio,
    kind: "listening",
    label: "Listening",
    value: "Hanuman Chalisa",
    image: "/currently/hanuman-chalisa-listening.png",
    imagePosition: "94% center",
    imageWidthClass: "sm:w-[52%]",
    badge: "Hanuman",
    surfaceClass:
      "bg-[linear-gradient(135deg,#fff8eb_0%,#ffefcf_100%)] dark:bg-[linear-gradient(135deg,#161006_0%,#261708_100%)]",
    textClass: "text-slate-950 dark:text-amber-50",
    metaClass: "text-slate-500 dark:text-amber-100/70",
  },
];

function imageMask(kind: CardKind) {
  if (kind === "listening") {
    return "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.24) 16%, rgba(0,0,0,0.68) 34%, rgba(0,0,0,0.96) 54%, #000 72%)";
  }

  return "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 18%, rgba(0,0,0,0.62) 36%, rgba(0,0,0,0.94) 56%, #000 74%)";
}

export function Currently() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onCanPlay = () => setAudioReady(true);
    const onLoadedMetadata = () => setAudioReady(true);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onError = () => {
      setAudioReady(false);
      setPlaying(false);
    };

    if (audio.readyState >= 1) {
      setAudioReady(true);
    }

    audio.load();
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  async function toggleHanumanAudio() {
    const audio = audioRef.current;
    if (!audioReady || !audio) return;

    if (audio.paused) {
      await audio.play();
      return;
    }

    audio.pause();
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-10">
      <audio ref={audioRef} preload="metadata" src={HANUMAN_AUDIO_SRC} />

      <div className="grid gap-3 sm:grid-cols-3">
        {ITEMS.map((item) => {
          const {
            icon: Icon,
            kind,
            label,
            value,
            href,
            image,
            imagePosition,
            imageWidthClass,
            surfaceClass,
            textClass,
            metaClass,
            badge,
          } = item;

          const isListening = kind === "listening";

          return (
            <div
              key={label}
              className={
                "group relative overflow-hidden rounded-[1.6rem] border border-border/70 p-4 backdrop-blur-md transition-colors hover:border-accent/50 sm:p-5 " +
                surfaceClass
              }
            >
              {image ? (
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-0 right-0 hidden bg-cover bg-center bg-no-repeat sm:block ${imageWidthClass ?? "sm:w-[56%]"}`}
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundPosition: imagePosition ?? "center",
                    WebkitMaskImage: imageMask(kind),
                    maskImage: imageMask(kind),
                  }}
                />
              ) : null}

              {badge ? (
                <div className="pointer-events-none absolute right-4 top-4 hidden rounded-full bg-white/88 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.22em] text-slate-700 shadow-sm sm:block dark:bg-white/90">
                  {badge}
                </div>
              ) : null}

              <div className="relative flex min-h-[7.5rem] items-center justify-between gap-3">
                <div className={`min-w-0 flex-1 ${isListening ? "sm:max-w-[58%]" : ""}`}>
                  <div className={`flex items-center gap-3 ${metaClass}`}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Currently {label}
                    </div>
                  </div>

                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`mt-3 block max-w-[14rem] font-display text-base font-semibold underline-offset-4 transition-colors hover:text-accent hover:underline sm:max-w-[11rem] sm:text-lg ${textClass}`}
                    >
                      {value}
                    </a>
                  ) : (
                    <div className={`mt-3 max-w-[14rem] font-display text-base font-semibold sm:text-lg ${isListening ? "sm:max-w-[16rem]" : "sm:max-w-[11rem]"} ${textClass}`}>
                      {value}
                    </div>
                  )}

                  {isListening && !audioReady ? (
                    <div className={`mt-2 font-mono text-[10px] uppercase tracking-[0.18em] ${metaClass}`}>
                      add Hanuman Chalisa MP3 in `public/currently`
                    </div>
                  ) : null}
                </div>

                {isListening ? (
                  <div className="absolute bottom-1 right-1 flex items-end">
                    {playing ? (
                      <div className="relative rounded-[1.1rem] border border-black/15 bg-[linear-gradient(180deg,rgba(26,32,44,0.94),rgba(12,16,24,0.96))] p-2.5 shadow-lg dark:border-white/10">
                        <div className="relative grid h-11 w-11 place-items-center rounded-[0.95rem] border border-white/10 bg-[radial-gradient(circle_at_45%_40%,rgba(255,255,255,0.08),transparent_45%),linear-gradient(180deg,rgba(40,48,63,0.96),rgba(17,20,29,0.98))]">
                          <div className="grid h-8 w-8 animate-[spin_1.8s_linear_infinite] place-items-center rounded-full border-2 border-white/80">
                            <div className="grid h-4.5 w-4.5 place-items-center rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.45)]">
                              <div className="h-1.5 w-1.5 rounded-full bg-white/90" />
                            </div>
                          </div>
                          <div className="absolute right-1.5 top-1.5 h-6 w-[2px] rotate-[42deg] rounded-full bg-white/70" />
                          <div className="absolute right-[0.34rem] top-[0.38rem] h-1.5 w-1.5 rounded-full bg-white/90" />
                        </div>
                        <button
                          type="button"
                          onClick={toggleHanumanAudio}
                          aria-label="Pause Hanuman Chalisa"
                          title="Pause Hanuman Chalisa"
                          className="absolute -right-1 -bottom-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/90 text-white shadow-lg transition hover:bg-slate-900"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={toggleHanumanAudio}
                        disabled={!audioReady}
                        aria-label="Play Hanuman Chalisa"
                        title={audioReady ? "Play Hanuman Chalisa" : "Add public/currently/hanuman-chalisa.mp3 to enable playback"}
                        className={
                          "inline-flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition " +
                          (audioReady
                            ? "bg-slate-950/76 text-white hover:scale-[1.03] dark:bg-black/55"
                            : "cursor-not-allowed bg-slate-950/38 text-white/65 dark:bg-black/35")
                        }
                      >
                        <Play className="h-5 w-5 fill-current" />
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
