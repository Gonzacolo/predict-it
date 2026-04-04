"use client";

import { useEffect, useRef, useState } from "react";

type DemoPreviewVideoProps = {
  src: string;
  poster?: string;
};

export function DemoPreviewVideo({ src, poster }: DemoPreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const playbackFailed = !src || failedSrc === src;

  useEffect(() => {
    if (playbackFailed) return;

    const el = videoRef.current;
    if (!el) return;

    void el.play().catch(() => {});
  }, [playbackFailed, src]);

  if (playbackFailed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-[var(--accent)]"
          style={{
            border:
              "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            background:
              "color-mix(in srgb, var(--accent) 8%, transparent)",
          }}
        >
          <span className="ml-0.5 text-xl">▶</span>
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
          Explainer video placeholder
        </p>
        <p className="max-w-xs px-4 text-xs text-[var(--muted)]">
          Add your walkthrough to{" "}
          <span className="whitespace-nowrap font-mono text-[11px]">
            public/videos/landing/explainer.mp4
          </span>
          , then set{" "}
          <span className="font-mono text-[11px]">LANDING_EXPLAINER_VIDEO_SRC</span>{" "}
          in <span className="font-mono text-[11px]">app/config.ts</span> to{" "}
          <span className="font-mono text-[11px]">
            {`"/videos/landing/explainer.mp4"`}
          </span>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={src}
        poster={poster || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={() => setFailedSrc(src)}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
        How it works
      </div>
    </>
  );
}
